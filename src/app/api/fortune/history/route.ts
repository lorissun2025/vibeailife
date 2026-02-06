/**
 * GET /api/fortune/history
 * 获取用户签文历史
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { prisma } = await import('@/lib/prisma');

    // 查询历史签文
    const history = await prisma.dailyFortune.findMany({
      where: {
        userId,
        skipped: false, // 只查询未跳过的记录
      },
      include: {
        fortune: true,
      },
      orderBy: {
        drawDate: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // 获取总数
    const total = await prisma.dailyFortune.count({
      where: {
        userId,
        skipped: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        history: history.map(item => ({
          id: item.id,
          drawDate: item.drawDate,
          fortune: {
            id: item.fortune!.id,
            type: item.fortune!.type,
            level: item.fortune!.level,
            title: item.fortune!.title,
            text: item.fortune!.text,
            interpretation: item.fortune!.interpretation,
          },
          appliedCount: item.appliedCount,
        })),
        total,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Get fortune history error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get fortune history' } },
      { status: 500 }
    );
  }
}
