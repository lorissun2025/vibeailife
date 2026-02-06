/**
 * GET /api/admin/users
 * 获取用户列表（支持分页和搜索）
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // 构建搜索条件
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // 获取用户总数
    const total = await prisma.user.count({ where })

    // 获取用户列表
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        isBanned: true,
        lastActiveAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
        total,
      },
    })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get users' } },
      { status: 500 }
    )
  }
}
