use ark_bls12_381::{Bls12_381, G1Affine, G1Projective, G2Projective, Fr as Scalar};
use ark_ec::{CurveGroup, Group, pairing::Pairing};
use ark_ff::{Field, UniformRand, Zero};
use ark_std::rand::rngs::StdRng;
use ark_std::rand::SeedableRng;
use log::info;

/// Generates a BBS+ signature over a message using the master secret (private key).
/// # Arguments
/// * `master_secret` - The private key as a Scalar.
/// * `message` - The message to sign as a Scalar.
///
/// # Returns
/// A tuple containing the signature (G1Affine, Scalar).
pub fn bbs_plus_sign(master_secret: &Scalar, message: &Scalar) -> (G1Affine, Scalar) {
    let mut rng = StdRng::seed_from_u64(0u64);

    // Step 1: Generate a random scalar 'e'
    let e = Scalar::rand(&mut rng);

    // Step 2: Compute 'denominator' = master_secret + message + e
    let denominator = *master_secret + *message + e;

    // Ensure the denominator is non-zero to compute the inverse
    if denominator.is_zero() {
        panic!("Denominator is zero; cannot compute inverse");
    }

    // Step 3: Compute s = 1 / (master_secret + message + e)
    let s = denominator.inverse().unwrap();

    // Step 4: Compute h = s * G1 generator
    let h_projective = G1Projective::generator() * s;

    // Convert h to affine for storage and verification efficiency
    let h = h_projective.into_affine();

    // Log the generated values for debugging
    info!(
        "BBS+ Signature generated: h (affine) = {:?}, random scalar e = {:?}",
        h, e
    );

    // Return the signature point (h) and the scalar e
    (h, e)
}

/// Verifies a BBS+ signature over a message using the public key.
///
/// # Arguments
/// * `public_key` - The public key as a G2Projective.
/// * `message` - The signed message as a Scalar.
/// * `signature` - A tuple containing the signature (G1Affine, Scalar).
///
/// # Returns
/// A boolean indicating whether the signature is valid or not.
pub fn bbs_plus_verify(
    public_key: &G2Projective,
    message: &Scalar,
    signature: &(G1Affine, Scalar),
) -> bool {
    let (h, e) = signature;

    // Log inputs for debugging
    info!("Verifying BBS+ Signature...");
    info!("Public key (projective): {:?}", public_key);
    info!("Message: {:?}", message);
    info!("Signature Point (h, affine): {:?}", h);
    info!("Signature Scalar (e): {:?}", e);

    // Step 1: Compute h' = public_key + (message + e) * G2 generator
    let h_prime = *public_key + G2Projective::generator() * (*message + *e);

    // Step 2: Compute pairing(h, h') and pairing(G1 generator, G2 generator)
    let pairing1 = Bls12_381::pairing(*h, h_prime);
    let pairing2 = Bls12_381::pairing(G1Projective::generator(), G2Projective::generator());

    // Log intermediate values for debugging
    info!("Pairing(h, h'): {:?}", pairing1);
    info!("Pairing(G1 generator, G2 generator): {:?}", pairing2);

    // Step 3: Check if the pairings are equal
    let is_valid = pairing1 == pairing2;

    // Log the result of verification
    info!("Signature is valid: {}", is_valid);

    // Return whether the signature is valid
    is_valid
}

/// Generates a pair of keys (secret key and public key).
///
/// # Returns
/// A tuple containing the secret key (Scalar) and the public key (G2Projective).
pub fn generate_keys() -> (Scalar, G2Projective) {
    let mut rng = StdRng::seed_from_u64(0u64);
    let secret_key = Scalar::rand(&mut rng);
    let public_key = G2Projective::generator() * secret_key;
    (secret_key, public_key)
}
