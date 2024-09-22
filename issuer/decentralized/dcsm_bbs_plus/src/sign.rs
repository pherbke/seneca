use bls12_381::{G1Projective, Scalar};
use ff::Field;  // Import the Field trait for Scalar::random

/// Commitment struct for round 1
pub struct Commitment {
    pub participant_id: u64,
    pub nonce_commitment: G1Projective,
}

/// Generate a nonce and its commitment for the signing protocol
pub fn generate_commitment(participant_id: u64, g1: G1Projective) -> (Scalar, Commitment) {
    let nonce = Scalar::random(rand::thread_rng());  // This now works
    let nonce_commitment = g1 * nonce;

    (
        nonce,
        Commitment {
            participant_id,
            nonce_commitment,
        }
    )
}
