use bls12_381::{G2Affine, G2Projective, Scalar};
use ff::Field;
use group::{Curve, Group};
use rand::rngs::OsRng;
use serde::{Serialize, Deserialize, Serializer, Deserializer};
use serde::ser::SerializeStruct;
use serde::de::{self, Visitor, MapAccess};
use std::fmt;

/// A structure to hold secret and public key shares for each participant.
#[derive(Debug, Clone)]
pub struct KeyShare {
    pub index: usize,                  // Participant's index (1-based)
    pub secret_share: Scalar,          // Scalar value of the secret share
    pub public_share: G2Projective,    // Public share derived from the secret share
}

// Implement custom serialization for KeyShare
impl Serialize for KeyShare {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        // Serialize the index
        let mut state = serializer.serialize_struct("KeyShare", 3)?;
        state.serialize_field("index", &self.index)?;

        // Serialize Scalar as a 32-byte array
        let secret_share_bytes = self.secret_share.to_bytes();
        state.serialize_field("secret_share", &secret_share_bytes)?;

        // Serialize G2Projective in compressed form (96 bytes)
        let public_share_bytes = self.public_share.to_affine().to_compressed();
        state.serialize_field("public_share", &public_share_bytes)?;

        state.end()
    }
}

// Implement custom deserialization for KeyShare
impl<'de> Deserialize<'de> for KeyShare {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        enum Field { Index, SecretShare, PublicShare };

        struct KeyShareVisitor;

        impl<'de> Visitor<'de> for KeyShareVisitor {
            type Value = KeyShare;

            fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                formatter.write_str("struct KeyShare")
            }

            fn visit_map<V>(self, mut map: V) -> Result<KeyShare, V::Error>
            where
                V: MapAccess<'de>,
            {
                let mut index = None;
                let mut secret_share_bytes = None;
                let mut public_share_bytes = None;

                while let Some(key) = map.next_key()? {
                    match key {
                        Field::Index => {
                            if index.is_some() {
                                return Err(de::Error::duplicate_field("index"));
                            }
                            index = Some(map.next_value()?);
                        }
                        Field::SecretShare => {
                            if secret_share_bytes.is_some() {
                                return Err(de::Error::duplicate_field("secret_share"));
                            }
                            secret_share_bytes = Some(map.next_value()?);
                        }
                        Field::PublicShare => {
                            if public_share_bytes.is_some() {
                                return Err(de::Error::duplicate_field("public_share"));
                            }
                            public_share_bytes = Some(map.next_value()?);
                        }
                    }
                }

                let index = index.ok_or_else(|| de::Error::missing_field("index"))?;
                let secret_share_bytes: [u8; 32] = secret_share_bytes.ok_or_else(|| de::Error::missing_field("secret_share"))?;
                let public_share_bytes: [u8; 96] = public_share_bytes.ok_or_else(|| de::Error::missing_field("public_share"))?;

                // Convert bytes back to Scalar using from_bytes (note that this could fail if the bytes do not represent a valid scalar)
                let secret_share = Scalar::from_bytes(&secret_share_bytes)
                    .ok_or_else(|| de::Error::custom("Failed to convert bytes to Scalar"))?;
                // Convert bytes back to G2Projective
                let public_share = G2Affine::from_compressed(&public_share_bytes)
                    .ok_or_else(|| de::Error::custom("Failed to convert bytes to G2Affine"))?
                    .into();

                Ok(KeyShare { index, secret_share, public_share })
            }
        }

        const FIELDS: &[&str] = &["index", "secret_share", "public_share"];
        deserializer.deserialize_struct("KeyShare", FIELDS, KeyShareVisitor)
    }
}

// Generate threshold keys using a simple secret sharing scheme.
pub fn generate_threshold_keys(n: usize, t: usize) -> (Vec<KeyShare>, G2Projective) {
    assert!(t <= n, "Threshold must be less than or equal to the number of participants.");

    // Create a random secret polynomial
    let mut rng = OsRng;
    let secret_polynomial: Vec<Scalar> = (0..t).map(|_| Scalar::random(&mut rng)).collect();

    // Generate shares and public key
    let mut shares = Vec::new();
    for i in 1..=n {
        let x = Scalar::from(i as u64);
        let secret_share = evaluate_polynomial(&secret_polynomial, x);
        let public_share = G2Projective::generator() * secret_share;
        shares.push(KeyShare {
            index: i, // Add participant's index
            secret_share,
            public_share
        });
    }

    // Public key derived from the constant term of the polynomial
    let public_key = G2Projective::generator() * secret_polynomial[0];

    (shares, public_key)
}

/// Evaluate a polynomial at a given point x.
fn evaluate_polynomial(coeffs: &[Scalar], x: Scalar) -> Scalar {
    coeffs.iter().rev().fold(Scalar::zero(), |acc, &coeff| acc * x + coeff)
}
