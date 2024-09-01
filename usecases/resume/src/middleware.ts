import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { issuerConfig } from "@/lib/issuer-config";

export async function middleware(request: NextRequest) {
  return NextResponse.json({ ...issuerConfig });
}

export const config = {
  matcher: "/.well-known/:path*",
};
