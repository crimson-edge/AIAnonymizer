import NextAuth from "next-auth"
import { Subscription, UserStatus } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name?: string | null
    firstName: string
    lastName: string
    isAdmin: boolean
    status: UserStatus
    subscription?: Subscription | null
  }

  interface Session {
    user: User & {
      id: string
      firstName: string
      lastName: string
      isAdmin: boolean
      status: UserStatus
      subscription?: Subscription | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName: string
    lastName: string
    isAdmin: boolean
    status: UserStatus
    subscription?: Subscription | null
  }
}
