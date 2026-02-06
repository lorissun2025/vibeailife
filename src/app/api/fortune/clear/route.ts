/**
 * POST /api/fortune/clear
 * 清除今日抽签记录（仅用于测试）
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { prisma } = await import('@/lib/prisma');

    // 删除今日的抽签记录
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deleted = await prisma.dailyFortune.deleteMany({
      where: {
        userId: userId,
        drawDate: {
          gte: today,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: '今日抽签记录已清除，可以重新测试',
      deleted: deleted.count,
    });
  } catch (error: any) {
    console.error('Clear fortune error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to clear fortune' } },
      { status: 500 }
    );
  }
}
