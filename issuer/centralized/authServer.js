import express from "express";
import cors from "cors";
import fs from "fs";
import { generateNonce, base64UrlEncodeSha256 } from "./cryptoUtils.js";

import { generateAccessToken, buildIdToken } from "./tokenUtils.js";
import jwt, { decode } from "jsonwebtoken";

const app = express();
const port = 7001;

const serverURL = "https://3f34-149-233-55-5.ngrok-free.app";
const authServerURL = "https://a3cb-149-233-55-5.ngrok-free.app";

const privateKey = fs.readFileSync("./certs/private.pem", "utf8");
const publicKey = fs.readFileSync("./certs/public.pem", "utf8");

// In-memory storage
const authorizationCodes = new Map();
const accessTokens = new Map();

const log = (req, res, next) => {
  console.log(req.url);
  next();
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(log);

app.post("/verifyAccessToken", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).send("Token is required");
  }

  jwt.verify(token, publicKey, { algorithms: ["ES256"] }, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    }

    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).send("Token has expired");
    }

    const storedToken = accessTokens.get(decoded.sub);
    if (storedToken !== token) {
      return res.status(401).send("Invalid token");
    }

    res.status(200).send("Token is valid");
  });
});

app.get("/.well-known/openid-configuration", (req, res) => {
  const config = {
    issuer: `${serverURL}`,
    authorization_endpoint: `${authServerURL}/authorize`,
    token_endpoint: `${authServerURL}/token`,
    jwks_uri: `${authServerURL}/jwks`,
    scopes_supported: ["openid"],
    response_types_supported: ["vp_token", "id_token"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "pre-authorized_code"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["ES256"],
    request_object_signing_alg_values_supported: ["ES256"],
    request_parameter_supported: true,
    request_uri_parameter_supported: true,
    token_endpoint_auth_methods_supported: ["private_key_jwt"],
    request_authentication_methods_supported: {
      authorization_endpoint: ["request_object"],
    },
    vp_formats_supported: {
      jwt_vp: {
        alg_values_supported: ["ES256"],
      },
      jwt_vc: {
        alg_values_supported: ["ES256"],
      },
    },
    subject_syntax_types_supported: [
      "did:key:jwk_jcs-pub",
      "did:ebsi:v1",
      "did:ebsi:v2",
    ],
    subject_trust_frameworks_supported: ["ebsi"],
    id_token_types_supported: [
      "subject_signed_id_token",
      "attester_signed_id_token",
    ],
  };
  res.status(200).send(config);
});

app.get("/authorize", (req, res) => {
  const {
    response_type,
    scope,
    state,
    client_id,
    authorization_details,
    redirect_uri,
    nonce,
    code_challenge,
    code_challenge_method,
    client_metadata,
    issuer_state,
  } = req.query;

  if (!client_id) {
    return res.status(400).send("Client id is missing");
  }

  if (!redirect_uri) {
    return res.status(400).send("Missing redirect URI");
  }

  if (response_type !== "code") {
    return res.status(400).send("Unsupported response type");
  }

  if (code_challenge_method !== "S256") {
    return res.status(400).send("Invalid code challenge method");
  }

  authorizationCodes.set(client_id, {
    codeChallenge: code_challenge,
    authCode: null,
    issuer_state: issuer_state,
  });

  const responseType = "id_token";
  const responseMode = "direct_post";
  const redirectURI = `${authServerURL}/direct_post`;

  const payload = {
    iss: serverURL,
    aud: client_id,
    nonce: nonce,
    state: state,
    client_id: client_id,
    response_uri: client_id,
    response_mode: responseMode,
    response_type: responseType,
    scope: "openid",
  };

  const header = {
    typ: "jwt",
    alg: "ES256",
    kid: `did:ebsi:zrZZyoQVrgwpV1QZmRUHNPz#key-2`,
  };

  const requestJar = jwt.sign(payload, privateKey, {
    algorithm: "ES256",
    noTimestamp: true,
    header,
  });
  const redirectUrl = `${redirect_uri}?state=${state}&client_id=${client_id}&redirect_uri=${redirectURI}&response_type=${responseType}&response_mode=${responseMode}&scope=openid&nonce=${nonce}&request=${requestJar}`;
  return res.redirect(302, redirectUrl);
});

app.post("/direct_post", async (req, res) => {
  let state = req.body["state"];
  let id_jwt = req.body["id_token"];
  if (id_jwt) {
    //TODO: verify id_token if necessary
    const iss = decode(id_jwt).iss;
    const authorizationCode = generateNonce(32);
    if (authorizationCodes.has(iss)) {
      const currentValue = authorizationCodes.get(iss);
      authorizationCodes.set(iss, {
        ...currentValue,
        authCode: authorizationCode,
      });
    }
    const redirectUrl = `http://localhost:8080?code=${authorizationCode}&state=${state}`;
    return res.redirect(302, redirectUrl);
  } else {
    return res.sendStatus(500);
  }
});

app.post("/token", async (req, res) => {
  const { client_id, code, code_verifier, grant_type, user_pin } = req.body;
  const pre_authorized_code = req.body["pre-authorized_code"];
  let credential_identifier;
  if (grant_type == "urn:ietf:params:oauth:grant-type:pre-authorized_code") {
    console.log("pre-auth code flow: ", pre_authorized_code);

    //TODO: implement this: verify the user_pin with the issuer generated pin
    if (user_pin !== "1234") {
      console.log("Invalid pin: ", user_pin);
      return res.status(400).send("Invalid pin");
    }
    credential_identifier = pre_authorized_code;
  } else {
    if (grant_type == "authorization_code") {
      console.log("authorization code workflow");
      const codeVerifierHash = await base64UrlEncodeSha256(code_verifier);
      const clientSession = authorizationCodes.get(client_id);
      credential_identifier = clientSession.issuer_state;
      if (
        code !== clientSession.authCode ||
        codeVerifierHash !== clientSession.codeChallenge
      ) {
        return res.status(400).send("Client could not be verified");
      }
    }
  }
  const generatedAccessToken = generateAccessToken(
    client_id,
    credential_identifier
  );
  accessTokens.set(client_id, generatedAccessToken);

  res.json({
    access_token: generatedAccessToken,
    token_type: "bearer",
    expires_in: 86400,
    c_nonce: generateNonce(16),
    c_nonce_expires_in: 86400,
  });
});

app.listen(port, () => {
  console.log("AuthServer is listening on port: " + port);
});
