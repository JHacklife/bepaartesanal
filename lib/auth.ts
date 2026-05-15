import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          return null
        }

        const passwordMatch = await compare(credentials.password, user.password)

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
