import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
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

    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return new Response(JSON.stringify(apiKeys), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
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

    await prisma.apiKey.delete({
      where: { id }
    })

    return new Response('Success', { status: 200 })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}