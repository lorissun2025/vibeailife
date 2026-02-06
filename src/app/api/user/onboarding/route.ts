import { NextRequest, NextResponse } from "next/server"
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;
    const userName = 'Test User'; // session.user.name;

    const { name, region } = await req.json()

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || userName,
        region: region || "international",
        hasOnboarded: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    )
  }
}
