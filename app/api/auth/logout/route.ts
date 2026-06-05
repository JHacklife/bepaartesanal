import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const authCookieNames = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
]

const getPublicOrigin = (request: NextRequest) => {
  const forwardedHostHeader = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const forwardedProtoHeader = request.headers.get("x-forwarded-proto")
  const forwardedPortHeader = request.headers.get("x-forwarded-port")

  const forwardedHost = forwardedHostHeader?.split(",")[0]?.trim()
  const forwardedProto =
    forwardedProtoHeader?.split(",")[0]?.trim() ||
    request.nextUrl.protocol.replace(":", "") ||
    "https"

  if (forwardedHost) {
    const hasExplicitPort = forwardedHost.includes(":")
    const isDefaultPort =
      (forwardedProto === "https" && forwardedPortHeader === "443") ||
      (forwardedProto === "http" && forwardedPortHeader === "80")

    const hostWithPort =
      !hasExplicitPort && forwardedPortHeader && !isDefaultPort
        ? `${forwardedHost}:${forwardedPortHeader}`
        : forwardedHost

    return `${forwardedProto}://${hostWithPort}`
  }

  const configuredUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL

  if (configuredUrl) {
    try {
      return new URL(configuredUrl).origin
    } catch {
      // Si el entorno esta mal formado, usamos los headers del proxy.
    }
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
