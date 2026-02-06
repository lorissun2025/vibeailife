/**
 * POST /api/chat/conversations/[id]/messages
 * Send a message and get AI response (supports streaming)
 */

import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';
import { sendMessage, checkUserLimit, incrementMessageCount } from '@/lib/ai/chat-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;

    const body = await req.json();
    const { content } = body as { content?: string };

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_INPUT', message: 'Message content is required' } },
        { status: 400 }
      );
    }

    // Check if user has reached limit
    const canSend = await checkUserLimit(userId);
    if (!canSend) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: '今日聊天次数已达上限，请升级到 Pro 版本解锁无限对话',
          },
        },
        { status: 429 }
      );
    }

    // Get user region, tier, and preferred provider
    const user = await getUserData(userId);
    const region = (user?.region || 'international') as 'cn' | 'international';
    const tier = (user?.tier || 'FREE') as 'FREE' | 'PRO' | 'ENTERPRISE';
    const preferredProvider = user?.preferredProvider as 'openai' | 'zhipu' | null;

    // Check if client wants streaming response
    const acceptHeader = req.headers.get('accept');
    const wantsStream = acceptHeader?.includes('text/event-stream');

    if (wantsStream) {
      // Streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            let fullResponse = '';

            const { id } = await params;
            await sendMessage({
              conversationId: id,
              content,
              userId,
              region,
              tier,
              preferredProvider,
              streamOptions: {
                onChunk: (chunk) => {
                  const data = `data: ${JSON.stringify({ chunk })}\n\n`;
                  controller.enqueue(encoder.encode(data));
                },
                onComplete: async (response) => {
                  fullResponse = response;
                  // Increment message count after successful response
                  await incrementMessageCount(userId);

                  // Fetch fortune info to include in response
                  const { getTodayFortune } = await import('@/lib/fortune/fortune-service');
                  const fortune = await getTodayFortune(userId);

                  console.log('🎯 准备发送签文数据到前端:', fortune ? {
                    title: fortune.title,
                    text: fortune.text,
                    interpretation: fortune.interpretation,
                  } : 'null');

                  const doneData = `data: ${JSON.stringify({
                    done: true,
                    full: response,
                    fortune: fortune ? {
                      title: fortune.title,
                      text: fortune.text,
                      interpretation: fortune.interpretation,
                    } : null
                  })}\n\n`;
                  controller.enqueue(encoder.encode(doneData));
                  controller.close();
                },
                onError: (error) => {
                  const errorData = `data: ${JSON.stringify({ error: error.message })}\n\n`;
                  controller.enqueue(encoder.encode(errorData));
                  controller.close();
                },
              },
            });
          } catch (error) {
            const errorData = `data: ${JSON.stringify({ error: 'Failed to get AI response' })}\n\n`;
            controller.enqueue(encoder.encode(errorData));
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const { id } = await params;
      const response = await sendMessage({
        conversationId: id,
        content,
        userId,
        region,
        tier,
        preferredProvider,
      });

      // Increment message count
      await incrementMessageCount(userId);

      return NextResponse.json({
        success: true,
        data: {
          message: response,
        },
      });
    }
  } catch (error: any) {
    console.error('Send message error:', error);

    // Check for specific error types
    if (error.message === 'Conversation not found') {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to send message' } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/conversations/[id]/messages
 * Get messages from a conversation
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Implement session check with NextAuth v5
    const userId = 'test-user'; // session.user.id;
    const { id } = await params;

    const { prisma } = await import('@/lib/prisma');

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Conversation not found' } },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to get messages' } },
      { status: 500 }
    );
  }
}

// Helper function to get user data
async function getUserData(userId: string) {
  const { prisma } = await import('@/lib/prisma');

  return await prisma.user.findUnique({
    where: { id: userId },
    select: { region: true, tier: true, preferredProvider: true },
  });
}
