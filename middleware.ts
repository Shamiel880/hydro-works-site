import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  const redirects: Record<string, string> = {
    "/product-category/hydroponic/hydroponic-systems": "/store",
    "/product-category/commercial": "/store",
    "/product-category/organic/more-organics": "/store",
    "/product-category/grow-space/pots": "/store"
  };

  if (redirects[url.pathname]) {
    url.pathname = redirects[url.pathname];
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}
