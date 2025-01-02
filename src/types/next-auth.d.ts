import NextAuth from "next-auth"
import { Subscription } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string | null
    isAdmin: boolean
    subscription?: Subscription | null
  }

  interface Session {
    user: User & {
      id: string
      isAdmin: boolean
      subscription?: Subscription | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
    subscription?: Subscription | null
  }
}
