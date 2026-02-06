/**
 * Goal Management API
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 创建目标 schema
const createGoalSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  deadline: z.string().optional(),
});

/**
 * POST /api/goals
 * 创建目标
 */
export async function POST(req: NextRequest) {
  try {
    const userId = 'test-user';

    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid goal data' } },
        { status: 400 }
      );
    }

    const { title, description, deadline } = parsed.data;

    const { prisma } = await import('@/lib/prisma');

    const goal = await prisma.goal.create({
      data: {
        userId,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: goal,
    });
  } catch (error: any) {
    console.error('Create goal error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create goal' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/goals
 * 获取目标列表
 */
export async function GET(req: NextRequest) {
  try {
    const userId = 'test-user';

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const { prisma } = await import('@/lib/prisma');

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: goals,
    });
  } catch (error: any) {
    console.error('Get goals error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get goals' } },
      { status: 500 }
    );
  }
}
