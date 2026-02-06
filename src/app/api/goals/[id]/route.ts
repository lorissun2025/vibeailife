/**
 * GET /api/goals/[id]
 * 获取单个目标详情
 * PATCH /api/goals/[id]
 * 更新目标
 * DELETE /api/goals/[id]
 * 删除目标
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

    const goal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Goal not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goal,
    });
  } catch (error: any) {
    console.error('Get goal error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get goal' } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = 'test-user';
    const { id } = await params;

    const body = await req.json();
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

    // 只更新提供的字段
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.deadline !== undefined) updateData.deadline = body.deadline ? new Date(body.deadline) : null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.progress !== undefined) updateData.progress = body.progress;

    const updated = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Update goal error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update goal' } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.goal.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('Delete goal error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete goal' } },
      { status: 500 }
    );
  }
}
