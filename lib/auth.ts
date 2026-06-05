import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Prisma } from "@prisma/client"
import { compare } from "bcryptjs"
import { getPrismaClient } from "./server/prisma"
import { authSecret } from "./auth-config"

const prisma = getPrismaClient()

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const hasGoogleCredentials = Boolean(googleClientId && googleClientSecret)

if (!hasGoogleCredentials && process.env.NODE_ENV === "production") {
  console.warn("[auth] Google OAuth deshabilitado: faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(hasGoogleCredentials
      ? [
        GoogleProvider({
          clientId: googleClientId as string,
          clientSecret: googleClientSecret as string,
        }),
      ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : ""
        const password = typeof credentials?.password === "string" ? credentials.password : ""

        if (!email || !password) {
          return null
        }

        let user

        try {
          user = await prisma.user.findUnique({
            where: { email },
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          const isDatabaseError =
            error instanceof Prisma.PrismaClientInitializationError ||
            error instanceof Prisma.PrismaClientKnownRequestError ||
            /can't reach database server|authentication failed|access denied|connect timeout|server has closed the connection/i.test(
              message,
            )

          console.error("[auth] Credentials database lookup failed", {
            timestamp: new Date().toISOString(),
            message,
            errorKind: isDatabaseError ? "DATABASE_ERROR" : "UNKNOWN_ERROR",
          })

          return null
        }

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await compare(password, user.password)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})
