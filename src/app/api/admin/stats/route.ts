/**
 * GET /api/admin/stats
 * 获取管理后台统计数据
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')

    // 获取总用户数
    const totalUsers = await prisma.user.count()

    // 获取今日活跃用户（今天有活跃记录的用户）
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeUsers = await prisma.user.count({
      where: {
        lastActiveAt: {
          gte: today,
        },
      },
    })

    // 获取付费用户数（非 FREE 等级）
    const paidUsers = await prisma.user.count({
      where: {
        tier: {
          in: ['PRO', 'ENTERPRISE'],
        },
      },
    })

    // 计算付费转化率
    const conversionRate = totalUsers > 0 ? paidUsers / totalUsers : 0

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        paidUsers,
        conversionRate,
      },
    })
  } catch (error: any) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } },
      { status: 500 }
    )
  }
}
