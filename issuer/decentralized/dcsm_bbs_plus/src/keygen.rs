use bls12_381::Scalar;
use ff::Field; // Required for Scalar::random
use rand::thread_rng; // For randomness
use shamirsecretsharing::*; // For Shamir secret sharing
use std::collections::HashMap;
use std::convert::TryInto; // For converting slices to arrays

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

    /// Reconstructs the master secret from a subset of participant shares using Lagrange interpolation.
    pub fn reconstruct_master_secret(&self, shares: &[(usize, Vec<u8>)]) -> Option<Scalar> {
        if shares.len() < self.threshold {
            return None;
        }

        let mut secret = Scalar::zero();

        for (i, (x_i, y_i)) in shares.iter().enumerate() {
            let mut numerator = Scalar::one();
            let mut denominator = Scalar::one();

            for (j, (x_j, _)) in shares.iter().enumerate() {
                if i != j {
                    let x_i_scalar = Scalar::from(*x_i as u64);
                    let x_j_scalar = Scalar::from(*x_j as u64);
                    numerator *= x_j_scalar;
                    denominator *= x_j_scalar - x_i_scalar;
                }
            }

            let y_i_array: [u8; 32] = y_i[..32].try_into().expect("Failed to convert share to array");
            let y_i_scalar = Scalar::from_bytes(&y_i_array).unwrap();

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
}