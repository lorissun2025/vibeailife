/**
 * GET /api/vibe/trends
 * 获取 Vibe 趋势分析
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    const { getVibeTrends } = await import('@/lib/vibe/vibe-service');

    const trends = await getVibeTrends(userId, days);

    return NextResponse.json({
      success: true,
      data: trends,
    });
  } catch (error: any) {
    console.error('Get vibe trends error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get vibe trends' } },
      { status: 500 }
    );
  }
}
