//api/verifier/direct-post

import { NextRequest, NextResponse } from "next/server";
import { decodeSdJwt, getClaims } from "@sd-jwt/decode";
import { digest } from "@sd-jwt/crypto-nodejs";
import { JwtPayload as OriginalJwtPayload, jwtDecode } from "jwt-decode";
import axios from "axios";

interface JwtPayload extends OriginalJwtPayload {
  vc: any;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { state: string } },
) {
  const urlEncodedString = await request.text();
  const urlParams = new URLSearchParams(urlEncodedString);
  const requestBody: any = {};
  const state = params.state.split(";");

  //@ts-ignore
  for (const [key, value] of urlParams.entries()) {
    requestBody[key] = value;
  }

  const vp_token = requestBody.vp_token;

  const decodedVPToken = await decodeSdJwt(vp_token, digest);
  const claims: any = await getClaims(
    decodedVPToken.jwt.payload,
    decodedVPToken.disclosures,
    digest,
  );
  if (claims) {
    const vpToken = claims.vp.verifiableCredential[0];

    const decodedVPToken: JwtPayload = jwtDecode(vpToken);

    await pushMessageToWebsocketClient(
      state[0],
      {
        vpToken,
        vc: decodedVPToken.vc,
      },
      state[1],
    );
  }

  return NextResponse.json({}, { status: 200 });
}

const pushMessageToWebsocketClient = async (
  clientId: string,
  message: any,
  destination?: string,
) => {
  try {
    const response = await axios.post(process.env.WS_URL + "/send-message", {
      clientId: clientId,
      message: message,
      destination: destination,
    });
    console.log("Message sent:", response.statusText);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
