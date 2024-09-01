import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import fs from "fs";
import { generateNonce } from "./cryptoUtils.js";
import { randomUUID } from "crypto";

const serverURL = "https://3f34-149-233-55-5.ngrok-free.app";
const authServerURL = "https://a3cb-149-233-55-5.ngrok-free.app";
const privateKey = fs.readFileSync("./certs/private.pem", "utf8");

const app = express();
const port = 7002;

const log = (req, res, next) => {
  console.log(req.url);
  next();
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(log);

// Middleware to authenticate access tokens
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const response = await fetch(`${authServerURL}/verifyAccessToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      return res.sendStatus(401);
    }
    const result = await response.text();
    console.log(result);
  } catch (error) {
    console.error("Error verifying token:", error);
  }
  next();
};

/* +++++++++++++++++++ Issuer Endpoints ++++++++++++++++++++++++ */

const offerMap = new Map();

app.post("/offer", (req, res) => {
  const uuid = randomUUID();
  const issuer_state = randomUUID();
  const pre_authorized_code = generateNonce(32);
  /*
  credentialData: {
    credentialSubject: {
      .... subject data 
    },
    type: ["LoginCredential" || "UniversityDegreeCredential"]
  }
  */
  const credentialData = req.body;
  offerMap.set(uuid, { issuer_state, pre_authorized_code, credentialData });

  let credentialOffer = `openid-credential-offer://?credential_offer_uri=${serverURL}/credential-offer/${uuid}`;
  res.send(credentialOffer);
});

app.post("/credential", authenticateToken, (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  const { credential_identifier } = jwt.decode(token);

  const requestBody = req.body;
  let decodedWithHeader;
  let decodedHeaderSubjectDID;
  if (requestBody.proof && requestBody.proof.jwt) {
    decodedWithHeader = jwt.decode(requestBody.proof.jwt, { complete: true });
    decodedHeaderSubjectDID = decodedWithHeader.payload.iss;
  }
  const credentialData = offerMap.get(credential_identifier);

  console.log(credentialData);
  let credentialSubject = credentialData
    ? {
        id: decodedHeaderSubjectDID,
        ...credentialData.credentialSubject,
        issuance_date: new Date(
          Math.floor(Date.now() / 1000) * 1000
        ).toISOString(),
      }
    : {
        id: decodedHeaderSubjectDID,
        family_name: "Doe",
        given_name: "John",
        birth_date: "1990-01-01",
        degree: "Bachelor of Computer Science",
        gpa: "1.2",
        age_over_18: true,
        issuance_date: new Date(
          Math.floor(Date.now() / 1000) * 1000
        ).toISOString(),
        // expiry_date: new Date(
        //   Math.floor(Date.now() + 60 / 1000) * 1000
        // ).toISOString(),
      };

  const payload = {
    iss: serverURL,
    sub: decodedHeaderSubjectDID || "",
    //exp: Math.floor(Date.now() / 1000) + 60 * 60,
    iat: Math.floor(Date.now() / 1000),
    vc: {
      credentialSubject: credentialSubject,
      expirationDate: new Date(
        (Math.floor(Date.now() / 1000) + 60 * 60) * 1000
      ).toISOString(),
      id: decodedHeaderSubjectDID,
      issuanceDate: new Date(
        Math.floor(Date.now() / 1000) * 1000
      ).toISOString(),
      issued: new Date(Math.floor(Date.now() / 1000) * 1000).toISOString(),
      issuer: "did:ebsi:zrZZyoQVrgwpV1QZmRUHNPz",
      type: credentialData
        ? credentialData.type
        : ["UniversityDegreeCredential"],
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://europa.eu/2018/credentials/eudi/pid/v1",
      ],
      issuer: "did:ebsi:zrZZyoQVrgwpV1QZmRUHNPz",
      validFrom: new Date(Math.floor(Date.now() / 1000) * 1000).toISOString(),
    },
  };
  const signOptions = {
    algorithm: "ES256",
  };

  const additionalHeaders = {
    kid: `did:ebsi:zrZZyoQVrgwpV1QZmRUHNPz#key-2`,
    typ: "jwt",
  };

  const idtoken = jwt.sign(payload, privateKey, {
    ...signOptions,
    header: additionalHeaders,
  });

  res.json({
    format: "jwt_vc",
    credential: idtoken,
    c_nonce: generateNonce(),
    c_nonce_expires_in: 86400,
  });
});

app.get("/.well-known/openid-credential-issuer", (req, res) => {
  const metadata = {
    credential_issuer: `${serverURL}`,
    authorization_server: `${authServerURL}`,
    credential_endpoint: `${serverURL}/credential`,
    credential_response_encryption: {
      alg_values_supported: ["ECDH-ES"],
      enc_values_supported: ["A128GCM"],
      encryption_required: false,
    },
    display: [
      {
        name: "Trust CV", //"Technical University of Berlin",
        locale: "en-US",
        logo: {
          url: "https://8cb0-149-233-55-5.ngrok-free.app/_next/image?url=%2Ftrust-cv-logo.png&w=256&q=75",
          //url: "https://logowik.com/content/uploads/images/technischen-universitat-berlin1469.jpg",
        },
      },
    ],
    credential_configurations_supported: {
      UniversityDegreeCredential: {
        format: "jwt_vc_json",
        scope: "UniversityDegree",
        cryptographic_binding_methods_supported: ["did:example"],
        credential_signing_alg_values_supported: ["ES256"],
        credential_definition: {
          type: ["VerifiableCredential", "UniversityDegreeCredential"],
          credentialSubject: {
            given_name: {
              display: [
                {
                  name: "Given Name",
                  locale: "en-US",
                },
              ],
            },
            family_name: {
              display: [
                {
                  name: "Surname",
                  locale: "en-US",
                },
              ],
            },
            degree: {
              display: [
                {
                  name: "Degree Name",
                  locale: "en-US",
                },
              ],
            },
            gpa: {
              display: [
                {
                  name: "GPA",
                },
              ],
            },
          },
        },
        proof_types_supported: {
          jwt: {
            proof_signing_alg_values_supported: ["ES256"],
          },
        },
        display: [
          {
            name: "University Credential",
            locale: "en-US",
            logo: {
              url: "https://logowik.com/content/uploads/images/technischen-universitat-berlin1469.jpg",
            },
            background_color: "#12107c",
            text_color: "#FFFFFF",
          },
        ],
      },
      LoginCredentials: {
        format: "jwt_vc_json",
        scope: "Login",
        cryptographic_binding_methods_supported: ["did:example"],
        credential_signing_alg_values_supported: ["ES256"],
        credential_definition: {
          type: ["VerifiableCredential", "LoginCredential"],
          credentialSubject: {
            userId: {
              display: [
                {
                  name: "userId",
                  locale: "en-US",
                },
              ],
            },
            email: {
              display: [
                {
                  name: "email",
                  locale: "en-US",
                },
              ],
            },
          },
        },
        proof_types_supported: {
          jwt: {
            proof_signing_alg_values_supported: ["ES256"],
          },
        },
        display: [
          {
            name: "Login Credential",
            locale: "en-US",
            logo: {
              url: "https://57a9-149-233-55-5.ngrok-free.app/_next/image?url=%2Ftrust-cv-logo.png&w=384&q=75",
            },
            background_color: "#12107c",
            text_color: "#FFFFFF",
          },
        ],
      },
    },
  };
  res.status(200).send(metadata);
});

app.get("/credential-offer/:id", (req, res) => {
  const entry = offerMap.get(req.params.id);
  let iss_state;
  let pre_auth_code;
  let credentialData;

  if (entry) {
    ({
      issuer_state: iss_state,
      pre_authorized_code: pre_auth_code,
      credentialData,
    } = entry);

    console.log(credentialData);

    if (iss_state) {
      offerMap.set(iss_state, credentialData);
    }

    if (pre_auth_code) {
      offerMap.set(pre_auth_code, credentialData);
    }
  }

  console.log(iss_state, pre_auth_code);

  const response = {
    credential_issuer: `${serverURL}`,
    credentials: credentialData
      ? credentialData.type
      : ["UniversityDegreeCredential"],
    grants: {
      authorization_code: {
        issuer_state: iss_state ?? randomUUID(),
      },
      "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
        "pre-authorized_code": pre_auth_code ?? randomUUID(),
        user_pin_required: true,
      },
    },
  };

  res.status(200).send(response);
});

app.listen(port, () => {
  console.log(`Credential Issuer API is running at http://localhost:${port}`);
});
