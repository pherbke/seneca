"use server";
const { randomUUID } = require("crypto");

const serverURL = process.env.SERVER_URL;
const response_uri = serverURL + "/api/verifier/direct-post/1";
const presentation_definition = {
  input_descriptors: [
    {
      id: "UniversityDegree",
      format: {
        jwt_vc_json: {
          alg: ["EdDSA"],
        },
      },
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "string",
              pattern: "UniversityDegree",
            },
          },
        ],
      },
    },
  ],
};

const presentation_definition_sd = {
  input_descriptors: [
    {
      id: "OpenBadgeCredential",
      format: {
        jwt_vc_json: {
          alg: ["EdDSA"],
        },
      },
      constraints: {
        fields: [
          {
            path: ["$.type"],
            filter: {
              type: "string",
              pattern: "OpenBadgeCredential",
            },
          },
        ],
      },
    },
  ],
};

const req_params = {
  client_id_scheme: "redirect_uri",
  response_uri: response_uri, //TODO Note: If the Client Identifier scheme redirect_uri is used in conjunction with the Response Mode direct_post, and the response_uri parameter is present, the client_id value MUST be equal to the response_uri value
  iss: serverURL,
  presentation_definition: presentation_definition,
  response_type: "vp_token",
  state: randomUUID(), // TODO: implement use of state properly
  exp: Math.floor(Date.now() / 1000) + 60,
  nonce: randomUUID(), // TODO: implement use of nonce properly
  iat: Math.floor(Date.now() / 1000),
  client_id: response_uri,
  response_mode: "direct_post",
};

function encodeQueryParams(params) {
  return Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&");
}

export async function getRequest() {
  const queryParams = {
    response_type: req_params.response_type,
    client_id: req_params.client_id,
    response_mode: req_params.response_mode,
    state: req_params.state,
    client_id_scheme: req_params.client_id_scheme,
    response_uri: req_params.response_uri,
    presentation_definition: JSON.stringify(req_params.presentation_definition),
  };
  const queryString = encodeQueryParams(queryParams);
  return `openid4vp://?${queryString}`;
}
