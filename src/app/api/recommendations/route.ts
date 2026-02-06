/**
 * GET /api/recommendations
 * 获取个性化推荐
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = 'test-user';

    const { getRecommendations } = await import('@/lib/recommendations/recommendation-service');

    const recommendations = await getRecommendations(userId);

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error: any) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get recommendations' } },
      { status: 500 }
    );
  }
}
