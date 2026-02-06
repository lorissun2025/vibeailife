/**
 * POST /api/fortune/draw
 * 抽签接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 抽签请求 schema
const drawFortuneSchema = z.object({
  type: z.enum(['GROWTH', 'CAREER', 'RELATIONSHIP', 'GENERAL']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const body = await req.json();
    const parsed = drawFortuneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid request data' } },
        { status: 400 }
      );
    }

    const { type } = parsed.data;

    const { prisma } = await import('@/lib/prisma');

    // 获取今天的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今天是否已抽签
    const existingFortune = await prisma.dailyFortune.findUnique({
      where: {
        userId_drawDate: {
          userId,
          drawDate: today,
        },
      },
    });

    if (existingFortune) {
      return NextResponse.json(
        {
          error: {
            code: 'ALREADY_DRAWN',
            message: '今天已经抽过签了,明天再来吧',
          },
        },
        { status: 400 }
      );
    }

    // 获取用户最近7天的签文历史,避免重复
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentFortuneIds = await prisma.dailyFortune.findMany({
      where: {
        userId,
        drawDate: { gte: sevenDaysAgo },
      },
      select: {
        fortuneId: true,
      },
    });

    const excludeIds = recentFortuneIds.map(f => f.fortuneId);

    // 构建查询条件
    const whereClause: any = {};

    // 如果指定了类型,按类型筛选;否则从所有类型中选择
    if (type) {
      whereClause.type = type;
    }

    // 排除最近7天已抽过的签文
    if (excludeIds.length > 0) {
      whereClause.id = { notIn: excludeIds };
    }

    // 随机抽取一支签文
    const fortunes = await prisma.fortuneLibrary.findMany({
      where: whereClause,
      take: 50, // 限制数量避免查询过大
    });

    if (fortunes.length === 0) {
      // 如果没有可用的签文(比如所有签文都在排除列表中),则重新查询,不排除
      const fallbackFortunes = await prisma.fortuneLibrary.findMany({
        where: type ? { type } : undefined,
        take: 50,
      });

      if (fallbackFortunes.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: 'NO_FORTUNE_AVAILABLE',
              message: '暂时没有可用的签文',
            },
          },
          { status: 500 }
        );
      }

      fortunes.push(...fallbackFortunes);
    }

    // 随机选择一支签
    const randomIndex = Math.floor(Math.random() * fortunes.length);
    const selectedFortune = fortunes[randomIndex];

    // 创建每日签文记录
    const dailyFortune = await prisma.dailyFortune.create({
      data: {
        userId,
        fortuneId: selectedFortune.id,
        drawDate: today,
        appliedCount: 0,
        skipped: false,
      },
      include: {
        fortune: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: dailyFortune.id,
        fortune: {
          id: dailyFortune.fortune.id,
          type: dailyFortune.fortune.type,
          level: dailyFortune.fortune.level,
          title: dailyFortune.fortune.title,
          text: dailyFortune.fortune.text,
          interpretation: dailyFortune.fortune.interpretation,
          tone: dailyFortune.fortune.tone,
        },
        drawDate: dailyFortune.drawDate,
      },
    });
  } catch (error: any) {
    console.error('Draw fortune error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to draw fortune' } },
      { status: 500 }
    );
  }
}
