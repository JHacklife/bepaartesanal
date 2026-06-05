import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const authCookieNames = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
]

const getPublicOrigin = (request: NextRequest) => {
  const configuredUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin
    } catch {
      // Si el entorno esta mal formado, usamos los headers del proxy.
    }
  }

  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return request.nextUrl.origin
}

const clearAuthCookies = (response: NextResponse) => {
  for (const cookieName of authCookieNames) {
    response.cookies.set(cookieName, "", {
      path: "/",
      maxAge: 0,
    })
  }
}

export async function POST(request: NextRequest) {
  const redirectUrl = new URL("/auth/signin", getPublicOrigin(request))
  const response = NextResponse.json({
    ok: true,
    redirectUrl: redirectUrl.toString(),
  })

  clearAuthCookies(response)

  return response
}

export async function GET(request: NextRequest) {
  const redirectUrl = new URL("/auth/signin", getPublicOrigin(request))
  const response = NextResponse.redirect(redirectUrl)

  clearAuthCookies(response)

  return response
}
