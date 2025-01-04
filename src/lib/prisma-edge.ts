import { PrismaClient } from '../../../prisma/generated/client/edge'

declare global {
  var prismaEdge: PrismaClient | undefined
}

const prismaEdge = globalThis.prismaEdge || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalThis.prismaEdge = prismaEdge

export default prismaEdge
