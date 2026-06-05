import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Prisma } from "@prisma/client"
import { compare } from "bcryptjs"
import { getPrismaClient, isDatabaseConfigured } from "./server/prisma"
import { authSecret } from "./auth-config"

const hasDatabase = isDatabaseConfigured()
const prisma = hasDatabase ? getPrismaClient() : null

if (!hasDatabase && process.env.NODE_ENV === "production") {
  console.error("[auth] Base de datos no configurada: falta DATABASE_URL")
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  ...(prisma ? { adapter: PrismaAdapter(prisma) } : {}),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!prisma) {
          console.error("[auth] Credentials deshabilitado: Prisma no disponible")
          return null
        }

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
