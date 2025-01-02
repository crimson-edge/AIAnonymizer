import NextAuth from "next-auth"
import { Subscription } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role?: string
    subscription?: Subscription
  }

  interface Session {
    user: User & {
      role?: string
      subscription?: Subscription
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    subscription?: Subscription
  }
}
