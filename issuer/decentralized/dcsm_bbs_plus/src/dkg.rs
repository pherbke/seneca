use bls12_381::{G1Projective, Scalar};
use ff::{Field};
use rand::thread_rng;
use shamirsecretsharing::*;
use log::{info};
use neptune::poseidon::*;
use neptune::{Strength};
use std::convert::TryInto;
use group::Curve;
use typenum::{U3};

/// The length of the data slice required by the shamirsecretsharing crate (64 bytes)
pub const DATA_SIZE: usize = 64;

/// Generates a cryptographically secure master secret using the BLS12-381 scalar field.
/// This function logs the generated master secret for tracking.
pub fn generate_master_secret() -> Scalar {
    // Create a random number generator
    let mut rng = thread_rng();

    // Generate a random scalar (master secret)
    let master_secret = Scalar::random(&mut rng);

    // Log the generated master secret
    info!("Generated master secret: {:?}", master_secret);

    master_secret
}

/// Distributes the master secret into shares using Shamir's Secret Sharing.
/// Returns a Result with a vector of shares (each represented as a byte array) or an error.
/// Logs the generated shares for tracking.
pub fn distribute_shares(master_secret: Scalar, threshold: usize, num_participants: usize) -> Result<Vec<Vec<u8>>, SSSError> {
    // Convert the master secret to a byte array
    let mut secret_bytes = master_secret.to_bytes().to_vec();

    // Ensure the secret is exactly 64 bytes, padded if necessary
    secret_bytes.resize(DATA_SIZE, 0); // Pad or truncate to 64 bytes

    // Log the secret being shared
    info!("Master secret (64 bytes): {:?}", secret_bytes);

    // Cast threshold and num_participants to u8 as required by create_shares
    let threshold_u8 = threshold as u8;
    let num_participants_u8 = num_participants as u8;

    // Use Shamir Secret Sharing to create the shares
    let shares = create_shares(&secret_bytes, num_participants_u8, threshold_u8)?;

    // Log each share
    for (i, share) in shares.iter().enumerate() {
        info!("Generated share for participant {}: {:?}", i + 1, share);
    }

    Ok(shares)
}

/// Reconstructs the master secret from a subset of participant shares using Lagrange interpolation.
/// The function expects a vector of shares (at least equal to the threshold) and logs the reconstruction process.
/// Custom error type for insufficient shares
#[derive(Debug)]
pub enum DKGError {
    TooFewShares,
    ShareReconstructionFailed,
}

pub fn reconstruct_master_secret(shares: Vec<Vec<u8>>, threshold: usize) -> Result<Scalar, DKGError> {
    // Ensure we have enough shares to meet the threshold
    if shares.len() < threshold {
        return Err(DKGError::TooFewShares);
    }

    // Log the shares used for reconstruction
    for (i, share) in shares.iter().enumerate() {
        info!("Reconstructing using share from participant {}: {:?}", i + 1, share);
    }

    // Attempt to reconstruct the secret using the provided shares
    let secret_bytes_result = combine_shares(&shares).map_err(|_| DKGError::ShareReconstructionFailed)?;

    // Handle the Option returned by combine_shares (None means failure)
    let secret_bytes = secret_bytes_result.ok_or(DKGError::ShareReconstructionFailed)?;

    // Convert the reconstructed secret back to a Scalar
    let secret_array: [u8; 32] = secret_bytes[..32].try_into().map_err(|_| DKGError::ShareReconstructionFailed)?;
    let master_secret = Scalar::from_bytes(&secret_array).unwrap_or_else(|| {
        info!("Failed to convert bytes to scalar: {:?}", secret_array);
        Scalar::zero()  // Fallback to zero in case of an error, which we handle later
    });

    if master_secret == Scalar::zero() {
        return Err(DKGError::ShareReconstructionFailed);
    }

    // Log the reconstructed master secret
    info!("Reconstructed master secret: {:?}", master_secret);

    Ok(master_secret)
}

/// Generates a random commitment in the elliptic curve group G1.
/// This is part of the zero-knowledge proof setup in the DKG process.
/// Returns a tuple of (random commitment, random scalar).
pub fn generate_random_commitment() -> (G1Projective, Scalar) {
    // Initialize a random number generator
    let mut rng = thread_rng();

    // Generate a random scalar (this will be our random value 'r')
    let random_scalar = Scalar::random(&mut rng);

    // Compute the commitment as the generator point in G1 multiplied by the random scalar
    let random_commitment = G1Projective::generator() * random_scalar;

    // Log the random scalar and commitment
    info!("Random scalar: {:?}", random_scalar);
    info!("Random commitment: {:?}", random_commitment);

    // Return the commitment and the random scalar
    (random_commitment, random_scalar)
}

/// Computes the Poseidon-based challenge hash from the provided inputs.
pub fn compute_challenge(master_secret: &Scalar, commitment: &G1Projective, random_scalar: &Scalar) -> Scalar {
    // Step 1: Create Poseidon constants for the Scalar type with the correct arity (3 inputs)
    let constants = PoseidonConstants::<Scalar, U3>::new_with_strength(Strength::Standard);
    info!("Poseidon constants created with arity 3 and standard strength");

    // Step 2: Initialize the Poseidon hasher with these constants
    let mut poseidon = Poseidon::new(&constants);
    info!("Poseidon hasher initialized");

    // Step 3: Input the master secret directly as a Scalar
    info!("Master secret: {:?}", master_secret);
    poseidon.input(*master_secret).expect("Poseidon input error for master secret");

    // Step 4: Convert the G1 commitment to affine form and extract the x-coordinate via compressed representation
    let commitment_affine = commitment.to_affine();
    let commitment_bytes = commitment_affine.to_compressed();  // Get compressed bytes (48 bytes)
    info!("Commitment (compressed): {:?}", commitment_bytes);

    // Use full 48 bytes for conversion
    let mut padded_commitment_bytes = [0u8; 64];  // 64-byte buffer for wide scalar input
    padded_commitment_bytes[..48].copy_from_slice(&commitment_bytes);
    info!("Padded commitment bytes (64 bytes): {:?}", padded_commitment_bytes);

    // Convert the padded bytes into a Scalar
    let commitment_scalar = Scalar::from_bytes_wide(&padded_commitment_bytes);
    info!("Commitment as Scalar: {:?}", commitment_scalar);

    // Input the commitment scalar into Poseidon
    poseidon.input(commitment_scalar).expect("Poseidon input error for commitment scalar");

    // Step 5: Input the random scalar directly as a Scalar
    info!("Random scalar: {:?}", random_scalar);
    poseidon.input(*random_scalar).expect("Poseidon input error for random scalar");

    // Step 6: Perform the hash and retrieve the result (which is also a Scalar)
    let challenge = poseidon.hash();
    info!("Poseidon hash (challenge): {:?}", challenge);

    // Return the resulting scalar (challenge)
    challenge
}

/// Generates a Schnorr proof for the master secret.
///
/// This function creates a zero-knowledge proof that the prover knows the master secret.
/// The proof consists of a commitment, challenge, and response.
///
/// Returns a tuple containing:
/// - The random commitment (G1 point),
/// - The challenge (Scalar),
/// - The response (Scalar).
pub fn generate_schnorr_proof(master_secret: &Scalar) -> (G1Projective, Scalar, Scalar) {
    // Step 1: Generate a random commitment and the corresponding random scalar 'r'
    let (random_commitment, random_scalar) = generate_random_commitment();

    // Step 2: Compute the challenge using the Poseidon-based hash function
    let challenge = compute_challenge(master_secret, &random_commitment, &random_scalar);
    info!("Challenge computed for Schnorr proof: {:?}", challenge);

    // Step 3: Calculate the response 's = r + (c * master_secret)'
    let response = random_scalar + (challenge * master_secret);
    info!("Response calculated for Schnorr proof: {:?}", response);

    // Return the components of the proof: commitment, challenge, and response
    (random_commitment, challenge, response)
}

/// Verifies a Schnorr proof that the prover knows the master secret.
///
/// This function checks whether the Schnorr proof components (commitment, challenge, response)
/// satisfy the verification equation.
///
/// # Arguments
/// * `public_key` - The public key (master secret multiplied by the G1 generator).
/// * `commitment` - The commitment (G1 point) from the Schnorr proof.
/// * `challenge` - The challenge (Scalar) computed in the proof.
/// * `response` - The response (Scalar) provided by the prover.
///
/// # Returns
/// * `bool` - `true` if the proof is valid, `false` otherwise.
pub fn verify_schnorr_proof(
    public_key: &G1Projective,
    commitment: &G1Projective,
    challenge: &Scalar,
    response: &Scalar,
) -> bool {
    // Step 1: Calculate the left-hand side of the verification equation: s * G1
    let lhs = G1Projective::generator() * response;

    // Step 2: Calculate the right-hand side of the verification equation: R + (c * public_key)
    let rhs = commitment + (public_key * challenge);

    // Step 3: Compare both sides to check if the equation holds
    let is_valid = lhs == rhs;

    // Log the verification details
    info!("Verifying Schnorr proof:");
    info!("Public key: {:?}", public_key);
    info!("Commitment: {:?}", commitment);
    info!("Challenge: {:?}", challenge);
    info!("Response: {:?}", response);
    info!("LHS (s * G1): {:?}", lhs);
    info!("RHS (R + c * public_key): {:?}", rhs);
    info!("Proof valid: {}", is_valid);

    // Return whether the proof is valid
    is_valid
}






