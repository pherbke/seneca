import jwt from "jsonwebtoken";
import fs from "fs";
import 'dotenv/config'
import { randomInt } from "crypto";

const privateKey = fs.readFileSync("./certs/demo_private.pem", "utf8");
const serverURL = process.env.SERVER_URL 

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
    sub: `${serverURL}`,
    aud: aud,
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    auth_time: Math.floor(Date.now() / 1000) - 60 * 5,
    nonce: randomInt(41435234),
  };

  const idToken = jwt.sign(payload, privateKey, {
    algorithm: "ES256",
  });

  return idToken;
}
