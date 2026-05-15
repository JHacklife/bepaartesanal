import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isPrivateRoute } from "@/lib/route-access"
import { authSecret } from "@/lib/auth-config"

export default async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Solo proteger rutas privadas explícitas.
  // Las rutas públicas y las inexistentes siguen su flujo normal (incluye 404 pública).
  if (!isPrivateRoute(pathname)) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: authSecret })

  if (!token) {
    const signInUrl = new URL("/auth/signin", req.url)
    signInUrl.searchParams.set("callbackUrl", `${pathname}${search}`)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
