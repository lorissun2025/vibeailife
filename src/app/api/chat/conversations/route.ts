/**
 * POST /api/chat/conversations
 * Create a new conversation
 */

import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { createConversation, checkUserLimit, incrementMessageCount } from '@/lib/ai/chat-service';
import { ChatMode } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    // For now, use a test user
    const userId = 'test-user'; // session.user.id;

    const body = await req.json();
    const { mode, title } = body as { mode?: ChatMode; title?: string };

    // Validate chat mode
    const validModes: ChatMode[] = ['FRIEND', 'COACH', 'LISTENER'];
    const chatMode: ChatMode = mode && validModes.includes(mode) ? mode : 'FRIEND';

    // Check if user has reached limit (only check message limit, not conversation creation)
    // Skip this check for conversation creation
    // const canCreate = await checkUserLimit(userId);

    // Create conversation
    const conversation = await createConversation({
      userId,
      mode: chatMode,
      title,
    });

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create conversation' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/conversations
 * Get user's conversations
 */

export async function GET(req: NextRequest) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { conversations, total } = await getConversations(
      userId,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get conversations' } },
      { status: 500 }
    );
  }
}

// Import helper functions
async function getConversations(userId: string, limit: number, offset: number) {
  const { prisma } = await import('@/lib/prisma');

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: {
      updatedAt: 'desc',
    },
    take: limit,
    skip: offset,
  });

  const total = await prisma.conversation.count({
    where: { userId },
  });

  return { conversations, total };
}
