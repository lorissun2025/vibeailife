/**
 * GET /api/goals/[id]/checkins
 * 获取目标的签到历史
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = 'test-user';
    const { id } = await params;

    const { prisma } = await import('@/lib/prisma');

    // 验证目标属于用户
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Goal not found' } },
        { status: 404 }
      );
    }

    // 获取签到历史
    const checkins = await prisma.goalCheckin.findMany({
      where: { goalId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: checkins,
    });
  } catch (error: any) {
    console.error('Get checkins error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get checkins' } },
      { status: 500 }
    );
  }
}
