/**
 * POST /api/goals/[id]/checkin
 * 目标签到
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const checkinSchema = z.object({
  note: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = 'test-user';
    const { id } = await params;

    const body = await req.json();
    const parsed = checkinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid checkin data' } },
        { status: 400 }
      );
    }

    const { note } = parsed.data;

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

    // 创建签到记录
    const checkin = await prisma.goalCheckin.create({
      data: {
        goalId: id,
        note,
      },
    });

    // 更新目标进度
    const newProgress = Math.min(goal.progress + 10, 100);
    await prisma.goal.update({
      where: { id },
      data: { progress: newProgress },
    });

    return NextResponse.json({
      success: true,
      data: {
        checkin,
        newProgress,
      },
    });
  } catch (error: any) {
    console.error('Goal checkin error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to checkin' } },
      { status: 500 }
    );
  }
}
