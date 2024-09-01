import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generateNonce, buildVpRequestJwt, pemToJWK } from "@/lib/cryptoUtils";
import fs from "fs";

const serverURL = process.env.SERVER_URL;
const root = process.env.ROOT_PATH;

const privateKey = fs.readFileSync(
  `${root}/src/lib/certs/private.pem`,
  "utf-8",
);
const publicKeyPem = fs.readFileSync(
  `${root}/src/lib/certs/public.pem`,
  "utf-8",
);

const jwks = pemToJWK(publicKeyPem, "public");

/* TODO: replace this with dynamic presentation definition */
const demo_presentation_definition_sd = {
  id: "046acbac-ea8d-4f95-8b57-f58dd178132b",
  name: "LoginCredential",
  format: {
    jwt_vc: {
      alg: ["ES256"],
    },
  },
  input_descriptors: [
    {
      id: "ef91319b-81a5-4f71-a602-de3eacccb543",
      constraints: {
        fields: [
          {
            path: ["$.credentialSubject.email"],
          },
        ],
      },
    },
  ],
};

const demo_presentation_definition = {
  id: "d49ee616-0e8d-4698-aff5-2a8a2362652d",
  name: "UniversityDegree",
  format: {
    "vc+sd-jwt": {
      alg: ["ES256"],
    },
    "vp+sd-jwt": {
      alg: ["ES256", "ES384"],
    },
  },
  input_descriptors: [
    {
      id: "abd4acb1-1dcb-41ad-8596-ceb1401a69c7",
      format: {
        "vc+sd-jwt": {
          alg: ["ES256", "ES384"],
        },
      },
      constraints: {
        fields: [
          {
            path: [
              "$.credentialSubject.degree",
              "$.vc.credentialSubject.degree",
            ],
          },
        ],
      },
      limit_disclosure: "required",
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: { state: string; pd: string } },
) {
  const url = new URL(request.url);

  const state = params.state ? params.state : uuidv4();
  const pd = url.searchParams.get("pd");
  if (!pd) {
    return new Response("Presentation defintion is required", { status: 400 });
  }

  const nonce = generateNonce(16);
  const response_uri = serverURL + "/api/verifier/direct-post" + "/" + state;
  let clientId = serverURL + "/api/verifier/direct-post" + "/" + state;

  const jwtToken = buildVpRequestJwt(
    state,
    nonce,
    clientId,
    response_uri,
    JSON.parse(pd),
    jwks,
    serverURL,
    privateKey,
  );

  return new Response(jwtToken.toString(), { status: 200 });
}
