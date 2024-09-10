use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use nodes::keygen::{
    keygen_begin, keygen_receive_commitments_and_validate_peers, KeyGenDKGPropsedCommitment,
};
use rand::rngs::OsRng;
use reqwest::header::CONTENT_TYPE;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::{collections::HashMap, sync::Arc};
use tokio::task;

type Db = Arc<Mutex<HashMap<u32, Vec<KeyGenDKGPropsedCommitment>>>>;

#[derive(Serialize, Deserialize, Debug)]
struct Info {
    node: u32,
}

#[derive(Clone)]
struct AppState {
    db: Db,
    node_id: u32,
    nodes: Arc<Vec<String>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct BroadcastData {
    sender: u32,
    commitment: KeyGenDKGPropsedCommitment,
}

async fn init(data: web::Data<AppState>) -> impl Responder {
    let mut rng = OsRng;
    let node_id = data.node_id;
    let (commitment, _) = keygen_begin(3, 2, node_id, "context", &mut rng).unwrap();

    // Broadcast the commitment to other nodes
    broadcast(&data, commitment.clone()).await;

    HttpResponse::Ok().body("Initialization complete")
}

async fn broadcast(data: &web::Data<AppState>, commitment: KeyGenDKGPropsedCommitment) {
    let client = Client::new();
    let broadcast_data = BroadcastData {
        sender: data.node_id,
        commitment,
    };

    for (index, node) in data.nodes.iter().enumerate() {
        if index as u32 != data.node_id {
            println!("Broadcasting {} : {}", index, node);
            let res = client
                .post(&format!("{}/receive", node))
                .header(CONTENT_TYPE, "application/json")
                .json(&broadcast_data)
                .send()
                .await;

            match res {
                Ok(response) => println!("{:?}", response),
                Err(err) => println!("Error sending request: {:?}", err),
            }
        }
    }
}

#[post("/receive")]
async fn receive(
    data: web::Data<AppState>,
    broadcast_data: web::Json<BroadcastData>,
) -> impl Responder {
    println!("Received from {}", broadcast_data.sender);
    let mut db = data.db.lock().unwrap();
    let sender = broadcast_data.sender;
    db.entry(sender)
        .or_insert_with(Vec::new)
        .push(broadcast_data.commitment.clone());

    HttpResponse::Ok().body("Commitment received and saved")
}

#[get("/verify_zkp")]
async fn verify_zkp(data: web::Data<AppState>) -> impl Responder {
    let db = data.db.lock().unwrap();

    // Collect peer commitments (excluding the node's own commitment)
    let peer_commitments: Vec<KeyGenDKGPropsedCommitment> = db
        .iter()
        .filter(|(&key, _)| key != data.node_id) // Exclude self node_id
        .flat_map(|(_, commitments)| commitments.clone()) // Clone commitments and flatten the Vec
        .collect();

    // Assume 'context' is something you have access to, passing it along
    let context = "context"; // Define or retrieve the context value appropriately

    // Validate the commitments (this is a placeholder, replace it with your real validation function)
    let validation_result =
        keygen_receive_commitments_and_validate_peers(peer_commitments, context);

    // Depending on the validation result, return a response
    match validation_result {
        Ok((invalid_peer, valid_peer_commitments)) => HttpResponse::Ok().body(format!(
            "ZKP validation successful: {}",
            invalid_peer.len() == 0
        )),
        Err(e) => HttpResponse::BadRequest().body(format!("ZKP validation failed: {:?}", e)),
    }
}

#[get("/check/{key}")]
//async fn check(data: web::Data<AppState>, key: web::Path<u32>) -> impl Responder {
async fn check(data: web::Data<AppState>, key: web::Path<u32>) -> impl Responder {
    println!("Received");
    let db = data.db.lock().unwrap();
    let value: &Vec<KeyGenDKGPropsedCommitment> = db.get(&key).unwrap();

    HttpResponse::Ok().json(value.to_vec())
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let num_servers = 3; // Number of servers to run
    let mut tasks = vec![];
    let nodes: Vec<String> = (0..num_servers)
        .map(|i| format!("http://127.0.0.1:{}", 8080 + i))
        .collect();
    let nodes = Arc::new(nodes);

    for i in 0..num_servers {
        let port = 8080 + i as u16;
        let nodes = nodes.clone();

        let task = task::spawn(async move {
            println!("Starting server on port {}", port);

            let db: Db = Arc::new(Mutex::new(HashMap::new()));
            let state = AppState {
                db: db.clone(),
                node_id: i as u32,
                nodes,
            };

            HttpServer::new(move || {
                App::new()
                    .app_data(web::Data::new(state.clone()))
                    .service(web::resource("/init").to(init))
                    .service(receive)
                    .service(verify_zkp)
                    .service(check)
            })
            .bind(format!("127.0.0.1:{}", port))
            .expect("Failed to bind address")
            .run()
            .await
            .expect("Failed to run server");
        });
        tasks.push(task);
    }

    // Await all server tasks
    for task in tasks {
        task.await.expect("Server task failed");
    }

    Ok(())
}

// fn main() {
//     let point = SerializableRistrettoPoint(RISTRETTO_BASEPOINT_POINT);
//     let serialized_data = serde_json::to_string(&point).unwrap();
//     println!("Serialized payload: {}", serialized_data);

//     let deserialized_data: SerializableRistrettoPoint =
//         serde_json::from_str(&serialized_data).unwrap();
//     println!("Deserialized data: {:?}", deserialized_data.0);

//     // Verify that the deserialized point is equal to the original
//     assert_eq!(point.0, deserialized_data.0);
//     println!("Deserialization successful and verified!");
// }
