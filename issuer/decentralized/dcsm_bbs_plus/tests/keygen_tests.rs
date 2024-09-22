#[cfg(test)]
mod keygen_tests {
    use crate::keygen::{generate_key_shares, combine_key_shares};
    use crate::utils::crypto_utils::verify_public_key;

    // Test for successful key generation
    #[test]
    fn test_key_generation() {
        let (public_key, secret_shares) = generate_key_shares(3, 5).expect("Key generation failed");

        assert_eq!(secret_shares.len(), 5); // 5 secret shares
        assert!(verify_public_key(&public_key)); // Check if public key is valid
    }

    // Test for combining key shares
    #[test]
    fn test_combine_key_shares() {
        let (public_key, secret_shares) = generate_key_shares(3, 5).expect("Key generation failed");

        // Combine the secret shares into a master secret
        let combined_key = combine_key_shares(&secret_shares[..3]).expect("Combining shares failed");

        assert_eq!(combined_key, public_key.secret_key); // Ensure the combined key matches the original secret key
    }

    // Test for failure when insufficient shares are provided
    #[test]
    #[should_panic]
    fn test_insufficient_key_shares() {
        let (_public_key, secret_shares) = generate_key_shares(3, 5).expect("Key generation failed");

        // Trying to combine less than the required threshold
        let _ = combine_key_shares(&secret_shares[..2]).expect("Should panic due to insufficient shares");
    }
}
