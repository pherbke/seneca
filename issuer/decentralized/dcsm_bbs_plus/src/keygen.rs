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
    pub fn new(threshold: u8, total_participants: usize) -> Self {
        let mut participants = HashMap::new();
        for id in 1..=total_participants {
            participants.insert(id, Participant::new(id));
        }
        Self {
            threshold: threshold as usize,
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

    /// Distributes key shares to participants using Shamir Secret Sharing.
    pub fn distribute_shares(&mut self) -> Result<(), SSSError> {
        // Ensure the master secret is generated
        let master_secret = match &self.master_secret {
            Some(secret) => secret,
            None => return Err(SSSError::BadInputLen(DATA_SIZE)),
        };

        // Generate shares using Shamir secret sharing
        let total_participants = self.participants.len() as u8;
        let shares = create_shares(master_secret, total_participants, self.threshold as u8)?;

        // Distribute the shares to each participant
        for (i, share) in shares.iter().enumerate() {
            if let Some(participant) = self.participants.get_mut(&(i + 1)) {
                participant.key_share = Some(share.clone());  // Store the share for the participant
            }
        }
        Ok(())
    }
}

// TESTS
#[cfg(test)]
mod tests {
    use super::*;
    use bls12_381::Scalar;
    use std::convert::TryInto;  // For converting slices to arrays

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
        dkg.distribute_shares().expect("Failed to distribute shares");

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
        dkg.distribute_shares().expect("Failed to distribute shares");

        // Get the first participant's key share and convert it to a scalar
        let key_share = dkg.participants.get(&1).unwrap().key_share.clone().unwrap();
        let key_share_array: [u8; 32] = key_share[..32].try_into().expect("Failed to convert key share to array");

        // Handle the case where the conversion fails
        let key_share_scalar = Scalar::from_bytes(&key_share_array);
        assert!(key_share_scalar.is_some().unwrap_u8() == 1, "Key share should be valid");

        // Ensure that the key share is valid (in this case, not zero)
        assert!(key_share_scalar.unwrap() != Scalar::zero(), "Key share should not be zero");
    }
}
