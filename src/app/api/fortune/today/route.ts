/**
 * GET /api/fortune/today
 * 查询今日抽签状态
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { prisma } = await import('@/lib/prisma');

    // 获取今天的日期（只取日期部分，忽略时间）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 查询用户今天是否已抽签
    const dailyFortune = await prisma.dailyFortune.findUnique({
      where: {
        userId_drawDate: {
          userId,
          drawDate: today,
        },
      },
      include: {
        fortune: true,
      },
    });

    const hasDrawn = !!dailyFortune;
    const canDraw = !hasDrawn;

    return NextResponse.json({
      success: true,
      data: {
        hasDrawn,
        canDraw,
        fortune: dailyFortune ? {
          id: dailyFortune.fortune.id,
          type: dailyFortune.fortune.type,
          level: dailyFortune.fortune.level,
          title: dailyFortune.fortune.title,
          text: dailyFortune.fortune.text,
          interpretation: dailyFortune.fortune.interpretation,
          tone: dailyFortune.fortune.tone,
        } : null,
        appliedCount: dailyFortune?.appliedCount || 0,
        skipped: dailyFortune?.skipped || false,
      },
    });
  } catch (error: any) {
    console.error('Get today fortune error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get today fortune' } },
      { status: 500 }
    );
  }
}
