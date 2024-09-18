use std::collections::{HashMap, HashSet};
use std::fs::File;
use std::io::{Error, Read, Write};
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use curve25519_dalek::ristretto::RistrettoPoint;
use futures_util::sink;
use futures_util::stream::StreamExt;
use nodes::helpers::{generate_jwt_header_and_payload, JWTPayload};
use nodes::keygen::{
    keygen_begin, keygen_finalize, keygen_receive_commitments_and_validate_peers,
    KeyGenDKGPropsedCommitment, KeyPair, Share,
};
use nodes::sign::{aggregate, preprocess, sign, validate, SigningCommitment, SigningResponse};
use rand::prelude::SliceRandom; // Added this import
use rand::rngs::OsRng;
use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::message::{BorrowedMessage, Message};
use rdkafka::producer::{FutureProducer, FutureRecord};
use rdkafka::{ClientConfig, Offset, TopicPartitionList};
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;
use tokio::time::sleep;

type Db<T> = Arc<Mutex<HashMap<u32, T>>>;

#[derive(Serialize, Deserialize, Debug)]
struct Info {
    node: u32,
}

#[derive(Clone)]
struct NodeState {
    node_id: u32,
    total_nodes: u32,
    threshold: u32,
    // Databases
    commitments_db: Db<KeyGenDKGPropsedCommitment>,
    shares_db: Db<Vec<Share>>,
    keypair_db: Db<nodes::keygen::KeyPair>,
    signing_commitments_db: Db<SigningCommitment>,
    signing_responses_db: Db<SigningResponse>,
    signers_pubkeys_db: Db<RistrettoPoint>,
    // Leader Election
    is_master: Arc<Mutex<bool>>,
    master_id: Arc<Mutex<u32>>,
    last_heartbeat: Arc<Mutex<HashMap<u32, Instant>>>,
    selected_signers: Arc<Mutex<HashSet<u32>>>,
    // Kafka
    producer: FutureProducer,
}

#[derive(Serialize, Deserialize, Debug)]
struct BroadcastCommitmentData {
    sender: u32,
    commitment: KeyGenDKGPropsedCommitment,
}

#[derive(Serialize, Deserialize, Debug)]
struct ShareData {
    sender: u32,
    receiver: u32,
    share: Share,
}

#[derive(Serialize, Deserialize, Debug)]
struct SigningCommitmentData {
    sender: u32,
    commitment: SigningCommitment,
}

#[derive(Serialize, Deserialize, Debug)]
struct SigningResponseData {
    sender: u32,
    signer_pubkey: RistrettoPoint,
    response: SigningResponse,
}

#[derive(Serialize, Deserialize, Debug)]
struct Heartbeat {
    sender: u32,
}

#[derive(Serialize, Deserialize, Debug)]
struct MasterAnnouncement {
    master_id: u32,
}

#[derive(Serialize, Deserialize, Debug)]
struct SigningRequest {
    payload: JWTPayload,
    selected_signers: Vec<u32>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let num_nodes = 5;
    let threshold = 3;

    let mut tasks = Vec::new();

    for i in 0..num_nodes {
        let node_id = i as u32 + 1; // Node IDs start from 1
        let total_nodes = num_nodes as u32;
        let threshold = threshold as u32;

        let task = tokio::spawn(async move {
            // Initialize Kafka producer and consumer
            let producer: FutureProducer = ClientConfig::new()
                .set("bootstrap.servers", "localhost:9092")
                .create()
                .expect("Producer creation error");

            let consumer1: StreamConsumer = create_consumer(node_id)
                .await
                .expect("Consumer1  creation failed");
            let consumer2: StreamConsumer = create_consumer(node_id)
                .await
                .expect("Consumer2  creation failed");
            let consumer3: StreamConsumer = create_consumer(node_id)
                .await
                .expect("Consumer3 creation failed");
            let consumer4: StreamConsumer = create_consumer(node_id)
                .await
                .expect("Consumer4 creation failed");
            let consumer5: StreamConsumer = create_consumer(node_id)
                .await
                .expect("Consumer5 creation failed");

            // Initialize node state
            let commitments_db: Db<KeyGenDKGPropsedCommitment> =
                Arc::new(Mutex::new(HashMap::new()));
            let shares_db: Db<Vec<Share>> = Arc::new(Mutex::new(HashMap::new()));
            let keypair_db: Db<nodes::keygen::KeyPair> = Arc::new(Mutex::new(HashMap::new()));
            let signing_commitments_db: Db<SigningCommitment> =
                Arc::new(Mutex::new(HashMap::new()));
            let signing_responses_db: Db<SigningResponse> = Arc::new(Mutex::new(HashMap::new()));
            let signer_pubkeys_db: Db<RistrettoPoint> = Arc::new(Mutex::new(HashMap::new()));

            let is_master = Arc::new(Mutex::new(false));
            let master_id = Arc::new(Mutex::new(0));
            let last_heartbeat = Arc::new(Mutex::new(HashMap::new()));
            let selected_signers = Arc::new(Mutex::new(HashSet::new()));

            let state = NodeState {
                node_id,
                total_nodes,
                threshold,
                commitments_db: commitments_db.clone(),
                shares_db: shares_db.clone(),
                keypair_db: keypair_db.clone(),
                signing_commitments_db: signing_commitments_db.clone(),
                signing_responses_db: signing_responses_db.clone(),
                signers_pubkeys_db: signer_pubkeys_db.clone(),
                is_master: is_master.clone(),
                master_id: master_id.clone(),
                last_heartbeat: last_heartbeat.clone(),
                selected_signers: selected_signers.clone(),
                producer: producer.clone(),
            };

            // Start background tasks
            let consumer_state1 = state.clone();

            let consumer_state2 = state.clone();
            let consumer_state3 = state.clone();
            let consumer_state4 = state.clone();
            let consumer_state5 = state.clone();

            let consumer_task1 = tokio::spawn(async move {
                consume_messages(consumer_state1, consumer1).await;
            });

            let consumer_task2 = tokio::spawn(async move {
                consume_messages(consumer_state2, consumer2).await;
            });

            let consumer_task3 = tokio::spawn(async move {
                consume_messages(consumer_state3, consumer3).await;
            });
            let consumer_task4 = tokio::spawn(async move {
                consume_messages(consumer_state4, consumer4).await;
            });
            let consumer_task5 = tokio::spawn(async move {
                consume_messages(consumer_state5, consumer5).await;
            });

            // let heartbeat_state = state.clone();
            // let heartbeat_task = tokio::spawn(async move {
            //     send_heartbeat(heartbeat_state).await;
            // });

            // let failure_detector_state = state.clone();
            // let failure_detector_task = tokio::spawn(async move {
            //     detect_failure(failure_detector_state).await;
            // });

            // Wait a bit for all nodes to start
            sleep(Duration::from_secs(2)).await;

            // Leader Election
            leader_election(state.clone()).await;

            // Wait a bit
            sleep(Duration::from_secs(2)).await;

            if !check_and_read_keypair(state.clone()).unwrap() {
                println!("No keys found: initiating distributed key-gen");

                // Start key generation
                start_keygen(state.clone()).await;

                // Wait for key generation to complete
                sleep(Duration::from_secs(5)).await;

                // Finalize key generation
                finalize_keygen(state.clone()).await;
            }

            // Wait a bit
            sleep(Duration::from_secs(2)).await;

            // If master, initiate signing
            {
                let is_master = {
                    let is_master_lock = state.is_master.lock().unwrap();
                    *is_master_lock
                };

                if is_master {
                    // Master node selects signers and initiates signing
                    let payload = JWTPayload {
                        message: "Hello, world!".to_string(),
                        sub: "1234567890".to_string(),
                        iat: 1516239022,
                        exp: 1516242622,
                    };
                    println!("Node {} init signing", state.node_id);
                    initiate_signing(state.clone(), payload).await;
                }
            }

            // Wait for the background tasks to finish
            consumer_task1.await.unwrap();
            consumer_task2.await.unwrap();
            consumer_task3.await.unwrap();
            consumer_task4.await.unwrap();
            consumer_task5.await.unwrap();
            // heartbeat_task.await.unwrap();
            // failure_detector_task.await.unwrap();
        });
        tasks.push(task);
    }

    // Wait for all tasks to complete
    for task in tasks {
        task.await.unwrap();
    }

    Ok(())
}

async fn create_consumer(node_id: u32) -> Result<StreamConsumer, Box<dyn std::error::Error>> {
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", format!("node-{}", node_id))
        .set("bootstrap.servers", "localhost:9092")
        .set("enable.partition.eof", "false")
        .set("session.timeout.ms", "6000")
        .set("enable.auto.commit", "true")
        .create()?;

    consumer
        .subscribe(&[
            "commitments",
            &format!("shares-{}", node_id),
            "signing_commitments",
            "signing_responses",
            "heartbeats",
            "master_announcements",
            "signing_requests",
        ])
        .expect("Can't subscribe to specified topics");

    Ok(consumer)
}

async fn consume_messages(state: NodeState, consumer: StreamConsumer) {
    let mut message_stream = consumer.stream();

    while let Some(result) = message_stream.next().await {
        match result {
            Ok(borrowed_message) => {
                // Process the message
                process_message(&state, borrowed_message).await;
            }
            Err(e) => {
                println!("Error while reading from stream. Error: {:?}", e);
            }
        }
    }
}

async fn process_message(state: &NodeState, msg: BorrowedMessage<'_>) {
    let payload = match msg.payload_view::<str>() {
        Some(Ok(s)) => s,
        Some(Err(e)) => {
            println!("Error while deserializing message payload: {:?}", e);
            return;
        }
        None => return,
    };
    match msg.topic() {
        "commitments" => {
            let data: BroadcastCommitmentData = serde_json::from_str(payload).unwrap();
            receive_commitment(state, data).await;
        }
        topic if topic.starts_with("shares-") => {
            let data: ShareData = serde_json::from_str(payload).unwrap();
            receive_share(state, data).await;
        }
        "signing_commitments" => {
            let data: SigningCommitmentData = serde_json::from_str(payload).unwrap();
            receive_signing_commitment(state, data).await;
        }
        "signing_responses" => {
            let data: SigningResponseData = serde_json::from_str(payload).unwrap();
            receive_signing_response(state, data).await;
        }
        "heartbeats" => {
            let data: Heartbeat = serde_json::from_str(payload).unwrap();
            handle_heartbeat(state, data).await;
        }
        "master_announcements" => {
            let data: MasterAnnouncement = serde_json::from_str(payload).unwrap();
            handle_master_announcement(state, data).await;
        }
        "signing_requests" => {
            let data: SigningRequest = serde_json::from_str(payload).unwrap();
            handle_signing_request(state, data).await;
        }
        _ => {}
    }
}

fn check_and_read_keypair(state: NodeState) -> Result<bool, Error> {
    let file_path = format!("keys/{}_key.txt", state.node_id);

    // Check if the file exists
    if Path::new(&file_path).exists() {
        // If the file exists, open it and read the contents
        let mut file = File::open(&file_path)?;
        let mut file_content = String::new();
        file.read_to_string(&mut file_content)?;

        // Deserialize the content into a KeyPair struct and return it
        let keypair: KeyPair = serde_json::from_str(&file_content)?;
        let mut db = state.keypair_db.lock().unwrap();
        db.insert(state.node_id, keypair.clone());
        return Ok(true);
    }
    Ok(false)
}

async fn start_keygen(state: NodeState) {
    let mut rng = OsRng;
    let node_id = state.node_id;
    let total_nodes = state.total_nodes;
    let threshold = state.threshold;
    let context = "nkjhfuijsndvkjndkvjnoöd"; // this should be a unique and consistent value

    // Begin the key generation protocol
    let (commitment, shares) =
        keygen_begin(total_nodes, threshold, node_id, context, &mut rng).unwrap();

    // Broadcast the commitment to other nodes via Kafka
    broadcast_commitment(&state, commitment.clone()).await;

    // Send shares to corresponding nodes via Kafka
    send_shares(&state, shares.clone()).await;
}

async fn broadcast_commitment(state: &NodeState, commitment: KeyGenDKGPropsedCommitment) {
    let data = BroadcastCommitmentData {
        sender: state.node_id,
        commitment,
    };

    let payload = serde_json::to_string(&data).unwrap();
    let key_str = state.node_id.to_string();

    let record: FutureRecord<String, String> = FutureRecord::to("commitments")
        .payload(&payload)
        .key(&key_str);

    let _ = state
        .producer
        .send(record, Duration::from_secs(0))
        .await
        .unwrap();
}

async fn send_shares(state: &NodeState, shares: Vec<Share>) {
    for share in shares {
        let receiver = share.receiver_index;
        if receiver != state.node_id {
            let data = ShareData {
                sender: state.node_id,
                receiver,
                share: share.clone(),
            };

            let payload = serde_json::to_string(&data).unwrap();
            let topic = format!("shares-{}", receiver);
            let key_str = state.node_id.to_string();

            let record: FutureRecord<String, String> =
                FutureRecord::to(&topic).payload(&payload).key(&key_str);

            let _ = state
                .producer
                .send(record, Duration::from_secs(0))
                .await
                .unwrap();
        } else {
            let mut db = state.shares_db.lock().unwrap();
            let mut node_shares_list = Vec::new();
            node_shares_list.push(share);
            db.insert(state.node_id, node_shares_list);
        }
    }
}

async fn receive_commitment(state: &NodeState, data: BroadcastCommitmentData) {
    let mut db = state.commitments_db.lock().unwrap();
    let sender = data.sender;
    db.insert(sender, data.commitment.clone());
}

async fn receive_share(state: &NodeState, data: ShareData) {
    let mut db = state.shares_db.lock().unwrap();
    let receiver = data.receiver;

    if receiver != state.node_id {
        println!("Received share for incorrect receiver");
        return;
    }

    let shares = db.entry(receiver).or_insert_with(Vec::new);
    shares.push(data.share.clone());
}

async fn finalize_keygen(state: NodeState) {
    let context = "nkjhfuijsndvkjndkvjnoöd"; // Should be consistent across nodes

    // Wait until all commitments are received
    loop {
        let ready = {
            let db = state.commitments_db.lock().unwrap();
            db.len() >= state.total_nodes as usize
        };
        if ready {
            break;
        } else {
            sleep(Duration::from_secs(1)).await;
        }
    }

    // Wait until all shares are received
    loop {
        let ready = {
            let db = state.shares_db.lock().unwrap();
            match db.get(&state.node_id) {
                Some(shares) if shares.len() >= (state.total_nodes - 1) as usize => true,
                _ => false,
            }
        };
        if ready {
            break;
        } else {
            sleep(Duration::from_secs(1)).await;
        }
    }

    // Validate commitments
    let peer_commitments: Vec<KeyGenDKGPropsedCommitment> = {
        let db = state.commitments_db.lock().unwrap();
        db.values().cloned().collect()
    };

    let (invalid_peers, valid_commitments) =
        match keygen_receive_commitments_and_validate_peers(peer_commitments, context) {
            Ok(result) => result,
            Err(e) => {
                println!("Validation error: {:?}", e);
                return;
            }
        };

    if !invalid_peers.is_empty() {
        println!("Invalid peers detected: {:?}", invalid_peers);
        return;
    }

    // Finalize key generation
    let keypair = {
        let shares_db = state.shares_db.lock().unwrap();
        let shares = shares_db.get(&state.node_id).unwrap();
        match keygen_finalize(state.node_id, state.threshold, shares, &valid_commitments) {
            Ok(kp) => kp,
            Err(e) => {
                println!("Keygen error: {:?}", e);
                return;
            }
        }
    };

    {
        // Store our keypair
        let mut db = state.keypair_db.lock().unwrap();
        db.insert(state.node_id, keypair.clone());
    }

    let mut file = File::create(format!("keys/{}_key.txt", state.node_id)).expect(&format!(
        "Cannot create key file for node {}",
        state.node_id
    ));
    let _ = file.write_all(serde_json::to_string(&keypair).unwrap().as_bytes());

    println!("Node {}: Key generation finalized", state.node_id);
}

async fn leader_election(state: NodeState) {
    // Simple leader election: Node with the lowest ID becomes the master
    {
        let mut master_id = state.master_id.lock().unwrap();
        *master_id = 1;
    }

    if state.node_id == 1 {
        {
            let mut is_master = state.is_master.lock().unwrap();
            *is_master = true;
        } // `is_master` is dropped here

        println!("Node {} is elected as the master", state.node_id);

        // Broadcast master announcement
        broadcast_master_announcement(state.clone()).await;
    } else {
        println!("Node {} recognizes Node {} as the master", state.node_id, 1);
    }
}

async fn broadcast_master_announcement(state: NodeState) {
    let data = MasterAnnouncement {
        master_id: state.node_id,
    };

    let payload = serde_json::to_string(&data).unwrap();
    let key_str = state.node_id.to_string();

    let record: FutureRecord<String, String> = FutureRecord::to("master_announcements")
        .payload(&payload)
        .key(&key_str);

    let _ = state
        .producer
        .send(record, Duration::from_secs(0))
        .await
        .unwrap();
}

async fn handle_master_announcement(state: &NodeState, data: MasterAnnouncement) {
    let mut master_id = state.master_id.lock().unwrap();
    *master_id = data.master_id;

    let mut is_master = state.is_master.lock().unwrap();
    *is_master = state.node_id == data.master_id;
}

async fn send_heartbeat(state: NodeState) {
    loop {
        let data = Heartbeat {
            sender: state.node_id,
        };

        let payload = serde_json::to_string(&data).unwrap();
        let key_str = state.node_id.to_string();

        let record: FutureRecord<String, String> = FutureRecord::to("heartbeats")
            .payload(&payload)
            .key(&key_str);

        let _ = state
            .producer
            .send(record, Duration::from_secs(0))
            .await
            .unwrap();

        sleep(Duration::from_secs(1)).await;
    }
}

async fn handle_heartbeat(state: &NodeState, data: Heartbeat) {
    let mut last_heartbeat = state.last_heartbeat.lock().unwrap();
    last_heartbeat.insert(data.sender, Instant::now());
}

async fn detect_failure(state: NodeState) {
    loop {
        sleep(Duration::from_secs(2)).await;

        let master_id = {
            let master_id = state.master_id.lock().unwrap();
            *master_id
        };

        if master_id == state.node_id {
            // I'm the master; no need to check
            continue;
        }

        let last_heartbeat_time = {
            let last_heartbeat = state.last_heartbeat.lock().unwrap();
            last_heartbeat.get(&master_id).cloned()
        };

        if let Some(last_heartbeat_time) = last_heartbeat_time {
            if last_heartbeat_time.elapsed() > Duration::from_secs(60) {
                println!(
                    "Node {}: Master {} failed. Initiating leader election.",
                    state.node_id, master_id
                );
                leader_election(state.clone()).await;
            }
        } else {
            // No heartbeat received yet
            println!(
                "Node {}: No heartbeat from master {}. Initiating leader election.",
                state.node_id, master_id
            );
            leader_election(state.clone()).await;
        }
    }
}

async fn initiate_signing(state: NodeState, payload: JWTPayload) {
    // Master selects signers
    let mut rng = OsRng;
    let mut nodes: Vec<u32> = (1..=state.total_nodes).collect();
    nodes.shuffle(&mut rng);

    let selected_signers: Vec<u32> = nodes.into_iter().take(state.threshold as usize).collect();

    {
        let mut signers = state.selected_signers.lock().unwrap();
        signers.extend(selected_signers.clone());
    }

    // Broadcast signing request
    let data = SigningRequest {
        payload,
        selected_signers: selected_signers.clone(),
    };

    let payload = serde_json::to_string(&data).unwrap();
    let key_str = state.node_id.to_string();

    let record: FutureRecord<String, String> = FutureRecord::to("signing_requests")
        .payload(&payload)
        .key(&key_str);

    let _ = state
        .producer
        .send(record, Duration::from_secs(0))
        .await
        .unwrap();
}

async fn handle_signing_request(state: &NodeState, data: SigningRequest) {
    let is_selected = data.selected_signers.contains(&state.node_id);
    {
        state
            .selected_signers
            .lock()
            .unwrap()
            .extend(&data.selected_signers);
    }
    if is_selected {
        let keypair = {
            let db = state.keypair_db.lock().unwrap();
            match db.get(&state.node_id) {
                Some(kp) => kp.clone(),
                None => {
                    println!("Keypair not generated yet");
                    return;
                }
            }
        };

        let mut rng = OsRng;
        let (commitments, mut nonces) = match preprocess(1, state.node_id, &mut rng) {
            Ok(result) => result,
            Err(e) => {
                println!("Preprocess error: {:?}", e);
                return;
            }
        };

        // Store our own signing commitment
        // {
        //     let mut db = state.signing_commitments_db.lock().unwrap();
        //     db.insert(state.node_id, commitments[0].clone());
        // }

        // Broadcast signing commitment via Kafka
        broadcast_signing_commitment(&state, commitments[0].clone()).await;

        let mut sorted_keys: Vec<u32> = Vec::new();
        // Wait until all signing commitments are received
        loop {
            let ready = {
                let db = state.signing_commitments_db.lock().unwrap();
                db.len() >= state.threshold as usize
            };
            if ready {
                let db = state.signing_commitments_db.lock().unwrap();
                sorted_keys.extend(db.keys().cloned());
                break;
            } else {
                sleep(Duration::from_secs(1)).await;
            }
        }

        sorted_keys.sort();
        println!("{:?}", sorted_keys);

        // Collect all signing commitments
        let signing_commitments: Vec<SigningCommitment> = {
            let db = state.signing_commitments_db.lock().unwrap();
            sorted_keys
                .iter()
                .map(|key| db.get(key).unwrap().clone())
                .collect()
        };

        // Sign the message
        let msg = generate_jwt_header_and_payload(&data.payload);

        let response = match sign(&keypair, &signing_commitments, &mut nonces, &msg) {
            Ok(resp) => resp,
            Err(e) => {
                println!("Signing error: {:?}", e);
                return;
            }
        };

        // Store our own signing response
        // {
        //     let mut db = state.signing_responses_db.lock().unwrap();
        //     db.insert(state.node_id, response.clone());
        // }

        // Broadcast signing response via Kafka
        broadcast_signing_response(&state, response.clone()).await;

        // Wait until all signing responses are received
        loop {
            let ready = {
                let db = state.signing_responses_db.lock().unwrap();
                db.len() >= state.threshold as usize
            };
            if ready {
                break;
            } else {
                sleep(Duration::from_secs(1)).await;
            }
        }

        // Collect all signing responses
        let signing_responses: Vec<SigningResponse> = {
            let db = state.signing_responses_db.lock().unwrap();
            sorted_keys
                .iter()
                .map(|key| db.get(key).unwrap().clone())
                .collect()
        };

        // Collect signer public keys
        let signer_pubkeys: HashMap<u32, RistrettoPoint> = {
            let db = state.signers_pubkeys_db.lock().unwrap();
            db.iter()
                .filter(|(&id, _)| data.selected_signers.contains(&id))
                .map(|(&id, pub_key)| (id, pub_key.clone())) // Clone the keypair here
                .collect()
        };

        let signature = match aggregate(
            &msg,
            &signing_commitments,
            &signing_responses,
            &signer_pubkeys,
        ) {
            Ok(sig) => sig,
            Err(e) => {
                println!("Aggregation error: {:?}", e);
                return;
            }
        };

        // Verify the signature
        let group_public_key = keypair.group_public;
        if let Err(e) = validate(&msg, &signature, group_public_key) {
            println!("Signature validation failed: {:?}", e);
            return;
        }

        // Return the signed JWT
        let signature_b64 = base64::encode_config(
            format!("{:?}:{:?}", signature.r.compress().as_bytes(), signature.z),
            base64::URL_SAFE_NO_PAD,
        );
        let signed_jwt = format!("{}.{}", msg, signature_b64);

        println!("Node {}: Signed JWT: {}", state.node_id, signed_jwt);
    }
}

async fn broadcast_signing_commitment(state: &NodeState, commitment: SigningCommitment) {
    let data = SigningCommitmentData {
        sender: state.node_id,
        commitment,
    };

    let payload = serde_json::to_string(&data).unwrap();
    let key_str = state.node_id.to_string();

    let record: FutureRecord<String, String> = FutureRecord::to("signing_commitments")
        .payload(&payload)
        .key(&key_str);

    let _ = state
        .producer
        .send(record, Duration::from_secs(0))
        .await
        .unwrap();
}

async fn broadcast_signing_response(state: &NodeState, response: SigningResponse) {
    let signer_pubkey = {
        let db = state.keypair_db.lock().unwrap();
        db.get(&state.node_id).unwrap().public.clone() // Clone the public key to ensure it outlives the lock
    };

    let data = SigningResponseData {
        sender: state.node_id,
        signer_pubkey,
        response,
    };

    let payload = serde_json::to_string(&data).unwrap();
    let key_str = state.node_id.to_string();

    let record: FutureRecord<String, String> = FutureRecord::to("signing_responses")
        .payload(&payload)
        .key(&key_str);

    let _ = state
        .producer
        .send(record, Duration::from_secs(0))
        .await
        .unwrap();
}

async fn receive_signing_commitment(state: &NodeState, data: SigningCommitmentData) {
    let is_selected = {
        let signers = state.selected_signers.lock().unwrap();
        signers.contains(&state.node_id) && signers.contains(&data.sender)
    };

    println!(
        "received signign commmitment {} from {} {}",
        state.node_id, data.sender, is_selected
    );

    if is_selected {
        let mut db = state.signing_commitments_db.lock().unwrap();
        let sender = data.sender;
        db.insert(sender, data.commitment.clone());
    }
}

async fn receive_signing_response(state: &NodeState, data: SigningResponseData) {
    let is_selected = {
        let signers = state.selected_signers.lock().unwrap();
        signers.contains(&state.node_id) && signers.contains(&data.sender)
    };

    println!(
        "received signign response {} from {}",
        state.node_id, data.sender
    );
    if is_selected {
        let mut db = state.signing_responses_db.lock().unwrap();
        let sender = data.sender;
        db.insert(sender, data.response.clone());
        let mut signers_pubkeys_db = state.signers_pubkeys_db.lock().unwrap();
        signers_pubkeys_db.insert(data.sender, data.signer_pubkey);
    }
}
