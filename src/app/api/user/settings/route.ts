/**
 * PUT /api/user/settings
 * Update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for settings update
const updateSettingsSchema = z.object({
  preferredProvider: z.enum(['openai', 'zhipu', 'auto']).optional(),
});

export async function PUT(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const body = await req.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Invalid settings data' } },
        { status: 400 }
      );
    }

    const { preferredProvider } = parsed.data;

    const { prisma } = await import('@/lib/prisma');

    // Update user settings
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        preferredProvider: preferredProvider === 'auto' ? null : preferredProvider,
      },
      select: {
        preferredProvider: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update settings' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/settings
 * Get user settings
 */
export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { prisma } = await import('@/lib/prisma');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredProvider: true,
        region: true,
        tier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get settings' } },
      { status: 500 }
    );
  }
}
