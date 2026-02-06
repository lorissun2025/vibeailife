/**
 * GET /api/admin/payments
 * 获取订单列表（支持分页和状态筛选）
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma')

    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'ALL'

    const skip = (page - 1) * limit

    // 构建筛选条件
    const where = status !== 'ALL'
      ? {
          status: status as any,
        }
      : {}

    // 获取订单总数
    const total = await prisma.payment.count({ where })

    // 获取订单列表
    const payments = await prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        payments,
        total,
      },
    })
  } catch (error: any) {
    console.error('Get payments error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get payments' } },
      { status: 500 }
    )
  }
}
