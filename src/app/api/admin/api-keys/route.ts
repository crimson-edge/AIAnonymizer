import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateApiKey } from "@/lib/auth/utils"

// ... existing GET and DELETE handlers ...

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user?.isAdmin) {
      return new Response('Unauthorized', { status: 401 })
    }

    const newApiKey = await prisma.apiKey.create({
      data: {
        key: `gsk_${generateApiKey()}`,
        status: 'ACTIVE',
        totalUsage: 0,
        totalTokensUsed: 0,
      }
    })

    return new Response(JSON.stringify(newApiKey), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}