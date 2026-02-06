import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"

const providers: any[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
]

// 开发环境添加简单的 Credentials Provider 用于测试
if (process.env.NODE_ENV === 'development') {
  providers.push(
    CredentialsProvider({
      id: 'test-login',
      name: '测试登录',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        // 简单的测试登录：任何邮箱和密码都能登录
        if (credentials?.email) {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: credentials.email as string,
                name: '测试用户',
                provider: 'email',
                tier: 'FREE',
                hasOnboarded: true,
                region: 'international' as const,
              },
            })
          }

          return user as any
        }

        return null
      },
    })
  )
}

// Only add EmailProvider if server config is available
if (process.env.EMAIL_SERVER_HOST && process.env.EMAIL_FROM) {
  const { default: EmailProvider } = await import("next-auth/providers/email")
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER_HOST,
      from: process.env.EMAIL_FROM,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: "google",
            providerId: account.providerAccountId,
            hasOnboarded: false,
          },
        })
      }
      return true
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.tier = (user as any).tier
        session.user.region = (user as any).region
        session.user.hasOnboarded = (user as any).hasOnboarded
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url === "/api/auth/signin") {
        return baseUrl
      }
      return url.startsWith("/") ? url : baseUrl
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      })
    },
  },
})

export const { GET, POST } = handlers
