/**
 * PATCH /api/admin/users/[id]/ban
 * 封禁或解封用户
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const banSchema = z.object({
  isBanned: z.boolean(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const parsed = banSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid request' } },
        { status: 400 }
      )
    }

    const { prisma } = await import('@/lib/prisma')

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // 更新用户封禁状态
    const updated = await prisma.user.update({
      where: { id },
      data: {
        isBanned: parsed.data.isBanned,
      },
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error: any) {
    console.error('Toggle ban error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update user' } },
      { status: 500 }
    )
  }
}
