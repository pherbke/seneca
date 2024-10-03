#[cfg(test)]
mod tests {
    use bls12_381::Scalar;
    use log::info;
    use dcsm_bbs_plus::helpers::poseidon_hash;
    use dcsm_bbs_plus::logger::initialize_logger;

    #[test]
    fn test_poseidon_hash() {
        // Ensure the logger is initialized
        initialize_logger();

        // Log start of the test
        info!("Starting test for Poseidon hash");

        // Input: two scalar values
        let input = vec![Scalar::from(123u64), Scalar::from(456u64)];
        info!("Test input: {:?}", input);

        // Input: two scalar values
        let input = vec![Scalar::from(123u64), Scalar::from(456u64)];

        // Perform Poseidon hash
        let result = poseidon_hash(&input);

        // Log the result from the hash function
        info!("Poseidon hash result from test: {:?}", result);

        // Ensure the result is a valid scalar (non-zero)
        assert_ne!(result, Scalar::zero(), "Hash result should not be zero");

        // Log test completion
        info!("Test for Poseidon hash completed successfully");
    }
}
