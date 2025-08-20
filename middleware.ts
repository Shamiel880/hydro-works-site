import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Remove Google tracking parameter
  if (url.searchParams.has("srsltid")) {
    url.searchParams.delete("srsltid");
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

// Optional: apply to all routes
export const config = {
  matcher: '/:path*',
};
