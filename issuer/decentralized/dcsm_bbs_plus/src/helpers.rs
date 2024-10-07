use neptune::{Poseidon, Strength};
use bls12_381::{Scalar};
use generic_array::typenum::U2; // U2 corresponds to arity 2
use log::{info, debug, error};
use neptune::poseidon::PoseidonConstants;

/// Perform Poseidon hash using Neptune with a fixed arity of 2
pub fn poseidon_hash(input: &[Scalar]) -> Scalar {
    // Log the start of the Poseidon hash function
    info!("Running Poseidon Hash with {} inputs", input.len());

    // Ensure the input length matches the expected arity (2 in this case)
    if input.len() != 2 {
        error!("Poseidon hash expects exactly 2 input elements, but got {}", input.len());
        panic!("Poseidon hash expects exactly 2 input elements.");
    }

    // Ensure the input length matches the expected arity (2 in this case)
    assert!(input.len() == 2, "Poseidon hash expects exactly 2 input elements.");

    // Create Poseidon constants for the fixed arity and standard strength
    let constants = PoseidonConstants::<Scalar, U2>::new_with_strength(Strength::Standard);

    // Initialize the Poseidon hasher with these constants
    let mut poseidon = Poseidon::new(&constants);

    // Log the input before hashing
    for (i, scalar) in input.iter().enumerate() {
        debug!("Input scalar [{}]: {:?}", i, scalar);
        poseidon.input(*scalar).expect("Input should fit into the buffer");
    }

    // Perform the hash and retrieve the result
    let result = poseidon.hash();

    // Log the resulting Poseidon hash
    info!("Poseidon hash result: {:?}", result);

    // Return the result as a scalar (the result of Poseidon is a vector of field elements, here we return the first one)
    result
}
