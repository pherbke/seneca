#[cfg(test)]
mod tests {
    use bls12_381::{G1Projective, Scalar};
    use ff::Field;
    use group::Group;
    use log::info;
    use rand::thread_rng;
    use dcsm_bbs_plus::dkg::*;
    use dcsm_bbs_plus::logger::initialize_logger;

    #[test]
    fn test_generate_master_secret() {
        // Initialize logger
        initialize_logger();

        // Log start of the test
        info!("Starting test for generate_master_secret");

        // Generate the master secret
        let master_secret = generate_master_secret();

        // Log the generated master secret
        info!("Master secret generated during test: {:?}", master_secret);

        // Ensure the master secret is a valid scalar (non-zero)
        assert_ne!(master_secret, Scalar::zero(), "Master secret should not be zero");

        // Log test completion
        info!("Test for generate_master_secret completed successfully");
    }

    #[test]
    fn test_distribute_shares() {
        // Initialize logger
        initialize_logger();

        // Log the start of the test
        info!("Starting test for distribute_shares");

        // Generate the master secret
        let master_secret = generate_master_secret();
        info!("Master secret generated: {:?}", master_secret);

        // Define threshold and number of participants
        let threshold = 4;
        let num_participants = 5;

        // Distribute shares and handle any errors
        let shares_result = distribute_shares(master_secret, threshold, num_participants);
        assert!(shares_result.is_ok(), "Failed to distribute shares");

        // Retrieve the shares
        let shares = shares_result.unwrap();

        // Ensure the correct number of shares is generated
        assert_eq!(shares.len(), num_participants, "Number of shares should equal the number of participants");

        // Log test completion
        info!("Test for distribute_shares completed successfully");
    }

    #[test]
    fn test_reconstruct_master_secret() {
        // Initialize logger
        initialize_logger();

        // Log the start of the test
        info!("Starting test for reconstruct_master_secret");

        // Generate the master secret
        let master_secret = generate_master_secret();
        info!("Original master secret: {:?}", master_secret);

        // Define threshold and number of participants
        let threshold = 3;
        let num_participants = 5;

        // Distribute shares
        let shares = distribute_shares(master_secret, threshold, num_participants).expect("Failed to distribute shares");

        // Select the first 'threshold' number of shares for reconstruction
        let shares_subset = shares.into_iter().take(threshold).collect::<Vec<_>>();

        // Reconstruct the master secret from the subset of shares
        let reconstructed_secret = reconstruct_master_secret(shares_subset, threshold).expect("Failed to reconstruct master secret");

        // Log the reconstructed master secret
        info!("Reconstructed master secret: {:?}", reconstructed_secret);

        // Ensure the reconstructed secret matches the original master secret
        assert_eq!(reconstructed_secret, master_secret, "Reconstructed secret should match the original");

        // Test reconstruction failure with fewer than the threshold number of shares
        let fewer_shares = distribute_shares(master_secret, threshold, num_participants).expect("Failed to distribute shares")
            .into_iter().take(threshold - 1).collect::<Vec<_>>();

        match reconstruct_master_secret(fewer_shares, threshold) {
            Err(DKGError::TooFewShares) => info!("Correctly failed to reconstruct with too few shares"),
            _ => panic!("Expected TooFewShares error"),
        }

        // Log test completion
        info!("Test for reconstruct_master_secret completed successfully");
    }

    #[test]
    fn test_generate_random_commitment() {
        // Initialize logger
        initialize_logger();

        // Log start of the test
        info!("Starting test for generate_random_commitment");

        // Generate a random commitment
        let (commitment, random_scalar) = generate_random_commitment();

        // Log the results
        info!("Random scalar generated during test: {:?}", random_scalar);
        info!("Commitment generated during test: {:?}", commitment);

        // Ensure that the random scalar is not zero
        assert_ne!(random_scalar, Scalar::zero(), "Random scalar should not be zero");

        // Ensure that the commitment is not the identity element
        assert_ne!(commitment, G1Projective::identity(), "Commitment should not be the identity element");

        // Log test completion
        info!("Test for generate_random_commitment completed successfully");
    }

    #[test]
    fn test_compute_challenge() {
        // Initialize logging to capture debug output
        initialize_logger();
        // Step 1: Generate a random master secret
        let master_secret = Scalar::random(&mut thread_rng());
        info!("Master secret generated for test: {:?}", master_secret);

        // Step 2: Generate a random G1 commitment and scalar
        let commitment = G1Projective::random(&mut thread_rng());
        let random_scalar = Scalar::random(&mut thread_rng());
        info!("Random G1 commitment generated for test: {:?}", commitment);
        info!("Random scalar generated for test: {:?}", random_scalar);

        // Step 3: Compute the challenge
        let challenge = compute_challenge(&master_secret, &commitment, &random_scalar);

        // Ensure the challenge is valid (not zero in this case)
        assert!(challenge != Scalar::zero(), "Challenge should not be zero");
        info!("Challenge successfully computed: {:?}", challenge);
    }

    #[test]
    fn test_generate_schnorr_proof() {
        // Initialize the logger
        initialize_logger();

        // Step 1: Generate a master secret
        let master_secret = generate_master_secret();
        info!("Master secret for Schnorr proof test: {:?}", master_secret);

        // Step 2: Generate the Schnorr proof
        let (commitment, challenge, response) = generate_schnorr_proof(&master_secret);

        // Log the generated proof components
        info!("Schnorr proof commitment: {:?}", commitment);
        info!("Schnorr proof challenge: {:?}", challenge);
        info!("Schnorr proof response: {:?}", response);

        // Step 3: Verify the proof
        // Recompute the commitment using the response and the challenge

        // The recomputed commitment should be G1 * response == commitment + challenge * master_secret
        let recomputed_commitment = G1Projective::generator() * response;
        let expected_commitment = commitment + (G1Projective::generator() * challenge * master_secret);

        // Ensure the commitment matches
        assert_eq!(recomputed_commitment, expected_commitment, "Schnorr proof verification failed");

        info!("Schnorr proof verification succeeded");
    }

    /// Test function for `verify_schnorr_proof`.
    #[test]
    fn test_verify_schnorr_proof() {
        // Initialize the logger for capturing info logs
        initialize_logger();

        // Step 1: Generate a master secret (private key)
        let master_secret = generate_master_secret();

        // Step 2: Derive the public key as master_secret * G1
        let public_key = G1Projective::generator() * master_secret;
        info!("Generated public key: {:?}", public_key);

        // Step 3: Generate a valid Schnorr proof
        let (commitment, challenge, response) = generate_schnorr_proof(&master_secret);
        info!("Generated Schnorr proof: Commitment = {:?}, Challenge = {:?}, Response = {:?}", commitment, challenge, response);

        // Step 4: Verify the valid Schnorr proof (it should pass)
        let is_valid = verify_schnorr_proof(&public_key, &commitment, &challenge, &response);
        assert!(is_valid, "Schnorr proof verification failed, but it should pass for a valid proof.");
        info!("Schnorr proof verified successfully for valid proof.");

        // Step 5: Test with an invalid proof (manipulating the response)
        let invalid_response = response + Scalar::one(); // Alter the response to make it invalid
        let is_invalid = verify_schnorr_proof(&public_key, &commitment, &challenge, &invalid_response);
        assert!(!is_invalid, "Schnorr proof verification passed, but it should fail for an invalid proof.");
        info!("Schnorr proof correctly rejected for invalid proof.");
    }

}




