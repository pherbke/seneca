use env_logger;
use log::info;
use bls12_381::Scalar;
use dcsm_bbs_plus::helpers::poseidon_hash;

fn main() {
    // Initialize the logger
    env_logger::init();
    info!("Starting BBS Threshold Project...");

    // Example data for hashing
    let input = vec![Scalar::from(123u64), Scalar::from(456u64)];

    // Call Poseidon hash function
    let hash_result = poseidon_hash(&input);
    info!("Final Poseidon hash: {:?}", hash_result);
}
