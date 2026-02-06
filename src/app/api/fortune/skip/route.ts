/**
 * POST /api/fortune/skip
 * 跳过今日抽签
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { prisma } = await import('@/lib/prisma');

    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 创建跳过记录
    const dailyFortune = await prisma.dailyFortune.create({
      data: {
        userId,
        fortuneId: '', // 跳过时没有签文ID,我们需要一个空的或使用默认值
        drawDate: today,
        appliedCount: 0,
        skipped: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        skipped: true,
        date: dailyFortune.drawDate,
      },
    });
  } catch (error: any) {
    console.error('Skip fortune error:', error);

    // 如果是唯一约束冲突(今天已经抽过或跳过),返回成功
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: true,
        data: {
          skipped: true,
          message: '今天已经抽过签或跳过了',
        },
      });
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to skip fortune' } },
      { status: 500 }
    );
  }
}
