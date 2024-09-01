import jwt from "jsonwebtoken";
import fs from "fs";

const privateKey = fs.readFileSync("./certs/private.pem", "utf8");
const serverURL = "https://9f2f-149-233-55-5.ngrok-free.app";

export function generateAccessToken(sub, credential_identifier) {
  const payload = {
    iss: `${serverURL}`,
    sub: sub,
    aud: `${serverURL}`,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    scope: "openid",
    credential_identifier: credential_identifier,
  };
  // Sign the JWT
  const token = jwt.sign(payload, privateKey, { algorithm: "ES256" });

  return token;
}

export function buildIdToken(aud) {
  const payload = {
    iss: `${serverURL}`,
    sub: "user123",
    aud: aud,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    auth_time: Math.floor(Date.now() / 1000) - 60 * 5,
    nonce: "nonceValue",
  };

  const idToken = jwt.sign(payload, privateKey, {
    algorithm: "ES256",
  });

  return idToken;
}
