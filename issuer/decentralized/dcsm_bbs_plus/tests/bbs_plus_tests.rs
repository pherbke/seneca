use ark_bls12_381::Fr as Scalar;
use ark_ff::UniformRand;
use ark_std::rand::rngs::StdRng;
use ark_std::rand::SeedableRng;

#[cfg(test)]
mod tests {
    use dcsm_bbs_plus::bbs_plus::{bbs_plus_sign, bbs_plus_verify, generate_keys};
    use super::*;

    #[test]
    fn test_bbs_plus_sign() {
        let mut rng = StdRng::seed_from_u64(0u64);
        let message = Scalar::rand(&mut rng);
        let master_secret = Scalar::rand(&mut rng);

        let signature = bbs_plus_sign(&master_secret, &message);

        println!("Test BBS+ Signature: signature = {:?}", signature);

        assert!(signature.0.is_on_curve());
    }

    #[test]
    fn test_bbs_plus_sign_and_verify() {
        let mut rng = StdRng::seed_from_u64(0u64);
        let message = Scalar::rand(&mut rng);

        // Generate keys using the new generate_keys function
        let (secret_key, public_key) = generate_keys();

        let signature = bbs_plus_sign(&secret_key, &message);

        println!("Generated signature: {:?}", signature);

        let is_valid = bbs_plus_verify(&public_key, &message, &signature);

        assert!(is_valid, "Signature should be valid.");
    }
}
