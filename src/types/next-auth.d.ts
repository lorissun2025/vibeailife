import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      tier: "FREE" | "PRO" | "ENTERPRISE"
      region?: "cn" | "international"
      hasOnboarded: boolean
    } & DefaultSession["user"]
  }

  interface User {
    tier: "FREE" | "PRO" | "ENTERPRISE"
    region?: "cn" | "international"
    hasOnboarded: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tier: "FREE" | "PRO" | "ENTERPRISE"
    region?: "cn" | "international"
    hasOnboarded: boolean
  }
}
