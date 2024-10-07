import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const serverURL = process.env.SERVER_URL!;

  const url = new URL(request.url);
  const stateParam = url.searchParams.get("state") || uuidv4();
  const presentation_def = url.searchParams.get("pd");
  let request_uri = `${serverURL}/api/verifier/get-vp-request/${stateParam}?pd=${presentation_def}`;

  const vpRequest = buildVP(serverURL, request_uri);

  return NextResponse.json({ vpRequest }, { status: 200 });
}

function buildVP(client_id: string, request_uri: string) {
  let result =
    "openid4vp://?client_id=" +
    encodeURIComponent(client_id) +
    "&request_uri=" +
    encodeURIComponent(request_uri);
  return result;
}
