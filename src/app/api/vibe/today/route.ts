/**
 * GET /api/vibe/today
 * Get today's vibe record
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { prisma } = await import('@/lib/prisma');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.vibeRecord.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: !!record,
    });
  } catch (error) {
    console.error('Get today vibe record error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get vibe record' } },
      { status: 500 }
    );
  }
}
