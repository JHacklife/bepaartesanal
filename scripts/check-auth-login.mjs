#!/usr/bin/env node

import { loadProjectEnv } from "./load-project-env.mjs"

loadProjectEnv()

const baseUrl = (
  process.env.AUTH_CHECK_BASE_URL ||
  process.env.NEXTAUTH_URL ||
  process.env.AUTH_URL ||
  "http://127.0.0.1:3000"
).replace(/\/$/, "")

const email =
  process.env.AUTH_CHECK_EMAIL ||
  process.env.TEST_USER_1_EMAIL ||
  "test1@bepa.local"
const password =
  process.env.AUTH_CHECK_PASSWORD ||
  process.env.TEST_USER_1_PASSWORD ||
  "BepaTest1234!"

const cookiePairs = (headers) => {
  const cookies = headers.getSetCookie
    ? headers.getSetCookie()
    : [headers.get("set-cookie")].filter(Boolean)

  return cookies.map((cookie) => cookie.split(";")[0])
}

const run = async () => {
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`)
  if (!csrfRes.ok) {
    throw new Error(`CSRF fallo con HTTP ${csrfRes.status}`)
  }

  const csrf = await csrfRes.json()
  let cookies = cookiePairs(csrfRes.headers)

  const loginRes = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookies.join("; "),
    },
    body: new URLSearchParams({
      csrfToken: csrf.csrfToken,
      email,
      password,
      redirect: "false",
      callbackUrl: `${baseUrl}/dashboard`,
      json: "true",
    }),
    redirect: "manual",
  })

  cookies = [...cookies, ...cookiePairs(loginRes.headers)]

  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: {
      cookie: cookies.join("; "),
    },
  })
  const session = await sessionRes.json()

  const dashboardRes = await fetch(`${baseUrl}/dashboard`, {
    headers: {
      cookie: cookies.join("; "),
    },
    redirect: "manual",
  })

  const result = {
    baseUrl,
    loginStatus: loginRes.status,
    loginLocation: loginRes.headers.get("location"),
    hasSessionCookie: cookies.some((cookie) =>
      cookie.includes("authjs.session-token"),
    ),
    sessionStatus: sessionRes.status,
    sessionEmail: session?.user?.email || null,
    dashboardStatus: dashboardRes.status,
    dashboardRedirect: dashboardRes.headers.get("location"),
  }

  console.log(JSON.stringify(result, null, 2))

  if (
    result.loginStatus !== 302 ||
    !result.hasSessionCookie ||
    result.sessionEmail !== email.trim().toLowerCase() ||
    result.dashboardStatus !== 200
  ) {
    process.exitCode = 1
  }
}

run().catch((error) => {
  console.error("No se pudo comprobar el login:", error)
  process.exit(1)
})
