import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifierConfig } from "@/lib/verifier-config";

export async function middleware(request: NextRequest) {
  return NextResponse.json({ ...verifierConfig });
}

export const config = {
  matcher: "/.well-known/:path*",
};
