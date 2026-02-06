/**
 * GET /api/chat/conversations/[id]
 * Get a single conversation with messages
 */

import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { getConversation } from '@/lib/ai/chat-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;
    const { id } = await params;

    const conversation = await getConversation(id, userId);

    if (!conversation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get conversation' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/conversations/[id]
 * Delete a conversation
 */

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;
    const { id } = await params;

    const deleted = await deleteConversation(id, userId);

    if (!deleted) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Conversation deleted' },
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete conversation' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chat/conversations/[id]
 * Update conversation title
 */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;
    const { id } = await params;

    const body = await req.json();
    const { title } = body as { title?: string };

    if (!title) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Title is required' } },
        { status: 400 }
      );
    }

    const updated = await updateConversationTitle(
      id,
      userId,
      title
    );

    if (!updated) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Title updated' },
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to update conversation' } },
      { status: 500 }
    );
  }
}

// Import helper functions
async function deleteConversation(conversationId: string, userId: string) {
  const { prisma } = await import('@/lib/prisma');

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) return false;

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  return true;
}

async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
) {
  const { prisma } = await import('@/lib/prisma');

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) return false;

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { title },
  });

  return true;
}
