/**
 * GET /api/user/usage-limit
 * 获取用户今日使用限额
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = 'test-user';
    const { prisma } = await import('@/lib/prisma');

    // 获取当前月份
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 查找或创建使用限额记录
    let usageLimit = await prisma.usageLimit.findUnique({
      where: {
        userId_period: {
          userId,
          period,
        },
      },
    });

    // 如果没有记录，创建一个
    if (!usageLimit) {
      usageLimit = await prisma.usageLimit.create({
        data: {
          userId,
          period,
          messageCount: 0,
          vibeCount: 0,
          goalCount: 0,
          tokensUsed: 0,
          resetAt: new Date(now.getFullYear(), now.getMonth() + 1, 1), // 下月1号
        },
      });
    }

    // 根据用户等级返回限制
    const tierLimits = {
      FREE: {
        maxMessages: 10,
        maxVibes: 5,
      },
      PRO: {
        maxMessages: -1, // -1 表示无限
        maxVibes: -1,
      },
      ENTERPRISE: {
        maxMessages: -1,
        maxVibes: -1,
      },
    };

    // 获取用户等级（这里暂时硬编码，实际应从用户表获取）
    const userTier = 'FREE'; // TODO: 从 session.user.tier 获取
    const limits = tierLimits[userTier as keyof typeof tierLimits];

    return NextResponse.json({
      success: true,
      data: {
        messageCount: usageLimit.messageCount,
        vibeCount: usageLimit.vibeCount,
        goalCount: usageLimit.goalCount,
        tokensUsed: usageLimit.tokensUsed,
        maxMessages: limits.maxMessages,
        maxVibes: limits.maxVibes,
        resetAt: usageLimit.resetAt,
      },
    });
  } catch (error: any) {
    console.error('Get usage limit error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get usage limit' } },
      { status: 500 }
    );
  }
}
