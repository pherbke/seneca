import crypto from "crypto";
import jwt from "jsonwebtoken";

export function pemToJWK(pem, keyType) {
  let key;
  let jwk;

  if (keyType === "private") {
    key = crypto.createPrivateKey(pem);
    jwk = key.export({ format: "jwk" });
  } else {
    key = crypto.createPublicKey(pem);
    jwk = key.export({ format: "jwk" });
  }

  jwk.kty = "EC";
  jwk.crv = "P-256";

  return jwk;
}

export function generateNonce(length = 12) {
  return crypto.randomBytes(length).toString("hex");
}

export function buildVpRequestJwt(
  state,
  nonce,
  client_id,
  response_uri,
  presentation_definition,
  jwk,
  serverURL,
  privateKey,
) {
  let jwtPayload = {
    client_id_scheme: "redirect_uri",
    response_uri: response_uri,
    iss: serverURL,
    presentation_definition: presentation_definition,
    response_type: "vp_token",
    state: state,
    exp: Math.floor(Date.now() / 1000) + 60,
    nonce: nonce,
    iat: Math.floor(Date.now() / 1000),
    client_id: client_id,
    response_mode: "direct_post",
    // nbf: Math.floor(Date.now() / 1000),
    // redirect_uri: redirect_uri,
    // scope: "openid",
  };

  const header = {
    alg: "ES256",
    kid: `trust-cv-did#key-1`,
  };

  const token = jwt.sign(jwtPayload, privateKey, {
    algorithm: "ES256",
    noTimestamp: true,
    header,
  });
  return token;
}
