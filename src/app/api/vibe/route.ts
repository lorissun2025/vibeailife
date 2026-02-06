/**
 * POST /api/vibe
 * 创建 Vibe 记录
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Vibe 记录 schema
const createVibeSchema = z.object({
  mood: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  tags: z.array(z.string()).optional().default([]),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const body = await req.json();
    const parsed = createVibeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid vibe data' } },
        { status: 400 }
      );
    }

    const { mood, energy, tags, note } = parsed.data;

    const { prisma } = await import('@/lib/prisma');

    // 检查用户今日使用限制
    const today = new Date();
    const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const usageLimit = await prisma.usageLimit.findUnique({
      where: {
        userId_period: {
          userId,
          period,
        },
      },
    });

    const FREE_VIBE_DAILY_LIMIT = 5;
    const currentCount = usageLimit?.vibeCount || 0;

    // 获取用户 tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });

    const isFree = user?.tier === 'FREE';

    if (isFree && currentCount >= FREE_VIBE_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '今日 Vibe 记录次数已达上限，请升级到 Pro 版本解锁无限记录',
          },
        },
        { status: 429 }
      );
    }

    // 创建 Vibe 记录
    const vibeRecord = await prisma.vibeRecord.create({
      data: {
        userId,
        mood,
        energy,
        tags,
        note,
      },
    });

    // 更新使用限制
    await prisma.usageLimit.upsert({
      where: {
        userId_period: {
          userId,
          period,
        },
      },
      create: {
        userId,
        period,
        messageCount: 0,
        vibeCount: 1,
        goalCount: 0,
        tokensUsed: 0,
        resetAt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      },
      update: {
        vibeCount: { increment: 1 },
      },
    });

    // 调用 AI 分析
    let aiResponse = null;
    try {
      const { analyzeVibe } = await import('@/lib/vibe/vibe-service');
      aiResponse = await analyzeVibe(mood, energy, tags, note);
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    // 如果 AI 分析成功，更新记录
    if (aiResponse) {
      await prisma.vibeRecord.update({
        where: { id: vibeRecord.id },
        data: { aiResponse },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: vibeRecord.id,
        mood: vibeRecord.mood,
        energy: vibeRecord.energy,
        tags: vibeRecord.tags,
        note: vibeRecord.note,
        aiResponse,
        createdAt: vibeRecord.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create vibe record error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create vibe record' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vibe
 * 获取 Vibe 记录列表
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { prisma } = await import('@/lib/prisma');

    const records = await prisma.vibeRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.vibeRecord.count({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: {
        records: records.map(record => ({
          id: record.id,
          mood: record.mood,
          energy: record.energy,
          tags: record.tags,
          note: record.note,
          aiResponse: record.aiResponse,
          createdAt: record.createdAt,
        })),
        total,
        limit,
        offset,
      },
    });
  } catch (error: any) {
    console.error('Get vibe records error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get vibe records' } },
      { status: 500 }
    );
  }
}
