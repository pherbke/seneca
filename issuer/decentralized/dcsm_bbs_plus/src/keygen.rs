use bls12_381::{Scalar,G1Projective};
use ff::Field; // Required for Scalar::random
use rand::thread_rng; // For randomness
use shamirsecretsharing::*; // For Shamir secret sharing
use std::collections::HashMap;
use std::convert::TryInto; // For converting slices to arrays
use light_poseidon::{Poseidon, PoseidonHasher};
use ark_bn254::Fr;
use ark_ff::{BigInteger, PrimeField};
use group::GroupEncoding;
use subtle::ConstantTimeEq;

pub const DATA_SIZE: usize = 64;

/// Represents a participant in the DKG (Distributed Key Generation) process.
pub struct Participant {
    pub id: usize,
    pub key_share: Option<Vec<u8>>,  // Share in Vec<u8> format
    pub public_share: Option<Vec<u8>>,  // Public share (to be filled later)
}

impl Participant {
    /// Creates a new participant with the given ID.
    pub fn new(id: usize) -> Self {
        Self {
            id,
            key_share: None,
            public_share: None,
        }
    }
}

/// Struct for holding a ZK proof.
#[derive(Clone)]  // This will automatically implement the Clone trait for ZkProof
pub struct ZkProof {
    pub commitment: G1Projective,  // The commitment to the secret
    pub response: Scalar,  // The response in the ZK proof
}

// Helper function to get a 32-byte array from BigInteger
fn bigint_to_32_bytes_be(bigint: &impl BigInteger) -> [u8; 32] {
    let bytes = bigint.to_bytes_be();
    let mut output = [0u8; 32];
    if bytes.len() > 32 {
        output.copy_from_slice(&bytes[bytes.len() - 32..]);
    } else {
        output[32 - bytes.len()..].copy_from_slice(&bytes);
    }
    output
}

fn bigint_to_64_bytes_le(bigint: &impl BigInteger) -> [u8; 64] {
    let bytes = bigint.to_bytes_le();
    let mut output = [0u8; 64];
    if bytes.len() > 64 {
        output[..64].copy_from_slice(&bytes[..64]);
    } else {
        output[..bytes.len()].copy_from_slice(&bytes);
    }
    output
}

/// DKG manager for handling key generation and participant management.
pub struct DKG {
    pub threshold: usize,
    pub participants: HashMap<usize, Participant>,  // Maps participant ID to their struct
    pub master_secret: Option<Vec<u8>>,  // Store master secret as bytes
}

impl DKG {
    /// Initializes the DKG system with a given threshold and number of participants.
    pub fn new(threshold: usize, total_participants: usize) -> Self {
        let mut participants = HashMap::new();
        for id in 1..=total_participants {
            participants.insert(id, Participant::new(id));
        }
        Self {
            threshold,
            participants,
            master_secret: None,
        }
    }

    /// Generates a cryptographically secure master secret. This should only be called once.
    pub fn generate_master_secret(&mut self) {
        let mut rng = thread_rng();
        let master_secret = Scalar::random(&mut rng);  // Generate a random scalar

        // Convert the scalar to a byte array and pad it to 64 bytes
        let mut master_secret_bytes = master_secret.to_bytes().to_vec();
        master_secret_bytes.resize(DATA_SIZE, 0);  // Pad to 64 bytes

        self.master_secret = Some(master_secret_bytes);
    }

    /// Generates a random polynomial for secret sharing and distributes the shares.
    pub fn generate_polynomial_and_shares(&mut self) -> Result<(), SSSError> {
        let master_secret = match &self.master_secret {
            Some(secret) => {
                let secret_array: [u8; 32] = secret[..32].try_into().expect("Failed to convert secret to array");
                Scalar::from_bytes(&secret_array).unwrap()
            }
            None => return Err(SSSError::BadInputLen(DATA_SIZE)),
        };

        let mut rng = thread_rng();

        // Generate random polynomial coefficients
        let mut coefficients = vec![master_secret];
        for _ in 1..self.threshold {
            coefficients.push(Scalar::random(&mut rng));
        }

        // Generate shares for each participant
        for participant in self.participants.values_mut() {
            let x = Scalar::from(participant.id as u64);
            let mut y = Scalar::zero();
            let mut x_power = Scalar::one();

            for coeff in &coefficients {
                y += *coeff * x_power;
                x_power *= x;
            }

            participant.key_share = Some(y.to_bytes().to_vec());
        }
        Ok(())
    }

    pub fn generate_commitment_with_proof(&self, participant_id: usize) -> Result<(Vec<u8>, ZkProof), &'static str> {
        // Retrieve the participant's key share
        let participant = self.participants.get(&participant_id)
            .ok_or("Participant not found")?;

        let key_share = participant.key_share
            .as_ref()
            .ok_or("Key share not found for participant")?;

        // Convert the key share into a field element
        let key_share_scalar = Scalar::from_bytes(&key_share[..32].try_into().unwrap()).unwrap();
        println!("Key share scalar: {:?}", key_share_scalar);

        // Initialize Poseidon hasher for commitment
        let mut poseidon = Poseidon::<Fr>::new_circom(1).unwrap();
        let key_share_as_field_element = Fr::from_be_bytes_mod_order(&key_share[..32]);

        // Generate commitment using Poseidon
        let commitment = poseidon.hash(&[key_share_as_field_element]).unwrap();
        let bigint = commitment.into_bigint();
        let commitment_bytes = bigint.to_bytes_be();
        println!("Generated commitment bytes: {:?}", commitment_bytes);

        // Generate ZK proof (Schnorr-like protocol)
        let mut rng = thread_rng();
        let random_scalar = Scalar::random(&mut rng);
        let random_commitment = G1Projective::generator() * random_scalar;
        println!("Random scalar: {:?}", random_scalar);
        println!("Random commitment: {:?}", random_commitment);

        // Serialize the random commitment to bytes (uncompressed)
        let random_commitment_bytes_array = random_commitment.to_bytes();
        let random_commitment_bytes = random_commitment_bytes_array.as_ref();

        // Create a new Poseidon hasher for computing the challenge
        let mut poseidon_for_challenge = Poseidon::<Fr>::new_circom(2).unwrap();

        // Generate challenge: Poseidon hash of the key share and the random commitment
        let challenge = poseidon_for_challenge.hash(&[
            key_share_as_field_element,
            Fr::from_be_bytes_mod_order(&random_commitment_bytes)
        ]).unwrap();
        println!("Generated challenge: {:?}", challenge);

        // Convert challenge into a Scalar
        let challenge_bigint = challenge.into_bigint();
        let challenge_bytes_wide = bigint_to_64_bytes_le(&challenge_bigint);
        let challenge_scalar = Scalar::from_bytes_wide(&challenge_bytes_wide);
        println!("Challenge scalar: {:?}", challenge_scalar);

        // Compute response: response = random_scalar - (challenge_scalar * key_share_scalar)
        let response = random_scalar - (challenge_scalar * key_share_scalar);
        println!("Response scalar: {:?}", response);

        // Return the commitment bytes and ZkProof
        let zk_proof = ZkProof {
            commitment: random_commitment,
            response,
        };

        Ok((commitment_bytes, zk_proof))
    }

    pub fn verify_commitment_with_proof(
        &self,
        participant_id: usize,
        commitment_bytes: Vec<u8>,
        zk_proof: ZkProof,
    ) -> Result<bool, &'static str> {
        // Retrieve the participant's key share
        let participant = self.participants.get(&participant_id)
            .ok_or("Participant not found")?;

        let key_share = participant.key_share
            .as_ref()
            .ok_or("Key share not found for participant")?;

        // Convert the key share into a field element
        let key_share_scalar = Scalar::from_bytes(&key_share[..32].try_into().unwrap()).unwrap();
        println!("Key share scalar: {:?}", key_share_scalar);

        // Recalculate the commitment using Poseidon
        let mut poseidon = Poseidon::<Fr>::new_circom(1).unwrap();
        let key_share_as_field_element = Fr::from_be_bytes_mod_order(&key_share[..32]);
        let recalculated_commitment = poseidon.hash(&[key_share_as_field_element]).unwrap();
        let recalculated_commitment_bytes = recalculated_commitment.into_bigint().to_bytes_be();

        // Ensure recalculated commitment matches the provided commitment
        if commitment_bytes != recalculated_commitment_bytes {
            println!("Commitment bytes mismatch! Recalculated: {:?}, Provided: {:?}", recalculated_commitment_bytes, commitment_bytes);
            return Ok(false);
        }

        // Recreate the challenge using the key share and the random commitment from zk_proof
        let random_commitment_bytes = zk_proof.commitment.to_bytes();
        let random_commitment_as_field = Fr::from_be_bytes_mod_order(random_commitment_bytes.as_ref());

        let mut poseidon_for_challenge = Poseidon::<Fr>::new_circom(2).unwrap();
        let challenge = poseidon_for_challenge.hash(&[
            key_share_as_field_element,
            random_commitment_as_field
        ]).unwrap();
        println!("Recreated challenge: {:?}", challenge);

        // Convert challenge into a Scalar
        let challenge_bigint = challenge.into_bigint();
        let challenge_bytes_wide = bigint_to_64_bytes_le(&challenge_bigint);
        let challenge_scalar = Scalar::from_bytes_wide(&challenge_bytes_wide);
        println!("Challenge scalar: {:?}", challenge_scalar);

        // Verify proof: response * G == random_commitment + challenge * key_share * G
        let lhs = G1Projective::generator() * zk_proof.response;
        let rhs = zk_proof.commitment + (G1Projective::generator() * (challenge_scalar * key_share_scalar));

        // Compare both sides
        let proof_valid = lhs == rhs;
        if !proof_valid {
            println!("Proof invalid: lhs != rhs. LHS: {:?}, RHS: {:?}", lhs, rhs);
        }

        Ok(proof_valid)
    }

    /// Reconstructs the master secret from a subset of participant shares using Lagrange interpolation.
    pub fn reconstruct_master_secret(&self, shares: &[(usize, Vec<u8>)]) -> Option<Scalar> {
        if shares.len() < self.threshold {
            return None;
        }

        let mut secret = Scalar::zero();

        for (i, (x_i, y_i)) in shares.iter().enumerate() {
            let mut numerator = Scalar::one();
            let mut denominator = Scalar::one();
            // Calculate the numerator and denominator for the Lagrange interpolation
            for (j, (x_j, _)) in shares.iter().enumerate() {
                if i != j {
                    let x_i_scalar = Scalar::from(*x_i as u64);
                    let x_j_scalar = Scalar::from(*x_j as u64);
                    numerator *= x_j_scalar;
                    denominator *= x_j_scalar - x_i_scalar;
                }
            }
            // Convert the share to a scalar
            let y_i_array: [u8; 32] = y_i[..32].try_into().expect("Failed to convert share to array");
            let y_i_scalar = Scalar::from_bytes(&y_i_array).unwrap();
            // Add the share to the secret
            secret += y_i_scalar * numerator * denominator.invert().unwrap();
        }

        Some(secret)
    }
}


// TESTS
#[cfg(test)]
mod tests {
    use super::*;
    use std::convert::TryInto;
    use bls12_381::Scalar;

    #[test]
    fn test_key_generation_and_distribution() {
        let mut dkg = DKG::new(3, 5);

        // Generate master secret
        dkg.generate_master_secret();

        // Ensure master secret is generated
        let secret = dkg.master_secret.clone().unwrap();
        let secret_array: [u8; 32] = secret[..32].try_into().expect("Failed to convert secret to array");
        let secret_scalar = Scalar::from_bytes(&secret_array).unwrap();
        assert!(secret_scalar != Scalar::zero(), "Master secret should not be zero");

        // Distribute shares
        dkg.generate_polynomial_and_shares().expect("Failed to generate polynomial and shares");

        // Ensure each participant has received a key share
        for participant in dkg.participants.values() {
            assert!(participant.key_share.is_some(), "Each participant should receive a key share");
        }
    }

    #[test]
    fn test_participant_share_as_scalar() {
        let mut dkg = DKG::new(3, 5);

        // Generate master secret and distribute shares
        dkg.generate_master_secret();
        dkg.generate_polynomial_and_shares().expect("Failed to distribute shares");

        // Get the first participant's key share and convert it to a scalar
        let key_share = dkg.participants.get(&1).unwrap().key_share.clone().unwrap();
        let key_share_array: [u8; 32] = key_share[..32].try_into().expect("Failed to convert key share to array");

        // Handle the case where the conversion fails
        let key_share_scalar = Scalar::from_bytes(&key_share_array);
        assert!(key_share_scalar.is_some().unwrap_u8() == 1, "Key share should be valid");

        // Ensure that the key share is valid (in this case, not zero)
        assert!(key_share_scalar.unwrap() != Scalar::zero(), "Key share should not be zero");
    }

    #[test]
    fn test_generate_polynomial_and_shares() {
        let mut dkg = DKG::new(3, 5);

        // Generate master secret
        dkg.generate_master_secret();

        // Ensure master secret is generated
        let secret = dkg.master_secret.clone().unwrap();
        let secret_array: [u8; 32] = secret[..32].try_into().expect("Failed to convert secret to array");
        let secret_scalar = Scalar::from_bytes(&secret_array).unwrap();
        assert!(secret_scalar != Scalar::zero(), "Master secret should not be zero");

        // Generate polynomial and shares
        dkg.generate_polynomial_and_shares().expect("Failed to generate polynomial and shares");

        // Ensure each participant has received a key share
        for participant in dkg.participants.values() {
            assert!(participant.key_share.is_some(), "Each participant should receive a key share");
        }

        // Check that the key share is a valid scalar and not zero
        for participant in dkg.participants.values() {
            let key_share = participant.key_share.clone().unwrap();
            let key_share_array: [u8; 32] = key_share[..32].try_into().expect("Failed to convert key share to array");
            let key_share_scalar = Scalar::from_bytes(&key_share_array).unwrap();
            assert!(key_share_scalar != Scalar::zero(), "Key share should not be zero");
        }
    }

    #[test]
    fn test_reconstruct_master_secret() {
        let mut dkg = DKG::new(3, 5);

        dkg.generate_master_secret();
        dkg.generate_polynomial_and_shares().expect("Failed to generate polynomial and shares");

        let shares: Vec<(usize, Vec<u8>)> = dkg.participants.iter()
            .take(dkg.threshold)
            .map(|(&id, participant)| (id, participant.key_share.clone().unwrap()))
            .collect();

        let reconstructed_secret = dkg.reconstruct_master_secret(&shares).expect("Failed to reconstruct master secret");

        let original_secret = dkg.master_secret.clone().unwrap();
        let original_secret_array: [u8; 32] = original_secret[..32].try_into().expect("Failed to convert secret to array");
        let original_secret_scalar = Scalar::from_bytes(&original_secret_array).unwrap();

        assert_eq!(reconstructed_secret, original_secret_scalar, "Reconstructed secret should match the original master secret");
    }

    #[test]
    fn test_generate_commitment_with_proof() {
        let mut dkg = DKG::new(3, 5);

        // Generate master secret and distribute shares
        dkg.generate_master_secret();
        dkg.generate_polynomial_and_shares().expect("Failed to distribute shares");

        // Generate commitment and ZK proof for participant 1
        let (commitment_bytes, zk_proof) = dkg.generate_commitment_with_proof(1).expect("Failed to generate commitment with ZK proof");

        // Verify that the commitment is non-empty and has the correct length
        assert_eq!(commitment_bytes.len(), 32, "Commitment length should be 32 bytes");
        assert_ne!(commitment_bytes, vec![0u8; 32], "Commitment should not be all zeros");

        // Verify the proof structure
        assert!(zk_proof.response != Scalar::zero(), "Response in ZK proof should not be zero");
        assert!(zk_proof.commitment != G1Projective::identity(), "Commitment in ZK proof should not be identity element");

        println!("Commitment and ZK proof for participant 1: {:?}", commitment_bytes);
    }

    #[test]
    fn test_verify_commitment_with_proof() {
        let mut dkg = DKG::new(3, 5);

        // Generate master secret and distribute shares
        dkg.generate_master_secret();
        dkg.generate_polynomial_and_shares().expect("Failed to distribute shares");

        // Generate commitment and ZK proof for participant 1
        let (commitment_bytes, zk_proof) = dkg
            .generate_commitment_with_proof(1)
            .expect("Failed to generate commitment with ZK proof");

        // Now verify the commitment and ZK proof
        let is_valid = dkg
            .verify_commitment_with_proof(1, commitment_bytes.clone(), zk_proof.clone())
            .expect("Failed to verify ZK proof");

        // Assert that the ZK proof is valid
        assert!(is_valid, "The ZK proof should be valid for participant 1");

        // Print out debugging information
        println!("ZK proof verification passed for participant 1");
    }


}