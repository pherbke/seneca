import jwt from "jsonwebtoken";
import fs from "fs";
import 'dotenv/config'

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
