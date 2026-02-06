/**
 * Chat Service
 * Manages conversations, message history, and AI interactions
 */

import { prisma } from '@/lib/prisma';
import {
  chatWithLLM,
  type LLMMessage,
  type ChatMode,
  type UserRegion,
  type UserTier,
  type LLMProviderName,
  type StreamOptions,
  estimateTokens,
} from './providers';
import {
  getTodayFortune,
  shouldApplyFortune,
  generateFortuneSystemPrompt,
  incrementFortuneAppliedCount,
  shouldLimitFortune,
} from '@/lib/fortune/fortune-service';

// ============== Types ==============

export interface CreateConversationParams {
  userId: string;
  mode: ChatMode;
  title?: string;
}

export interface SendMessageParams {
  conversationId: string;
  content: string;
  userId: string;
  region: UserRegion;
  tier: UserTier;
  preferredProvider?: 'openai' | 'zhipu' | null;
  streamOptions?: StreamOptions;
}

export interface ConversationWithMessages {
  id: string;
  mode: ChatMode;
  title: string | null;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  messages: Array<{
    id: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    createdAt: Date;
  }>;
}

// ============== Conversation Management ==============

/**
 * Create a new conversation
 */
export async function createConversation(params: CreateConversationParams) {
  const { userId, mode, title } = params;

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      mode,
      title: title || getDefaultTitle(mode),
    },
  });

  return conversation;
}

/**
 * Get conversation with messages
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<ConversationWithMessages | null> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    mode: conversation.mode as ChatMode,
    title: conversation.title,
    messageCount: conversation.messageCount,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: conversation.messages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'USER' | 'ASSISTANT',
      content: msg.content,
      createdAt: msg.createdAt,
    })),
  };
}

/**
 * Get user's conversations (paginated)
 */
export async function getConversations(
  userId: string,
  limit = 20,
  offset = 0
) {
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

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
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

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
): Promise<boolean> {
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

// ============== Message Management ==============

/**
 * Send a message and get AI response
 */
export async function sendMessage(params: SendMessageParams): Promise<string> {
  const { conversationId, content, userId, region, tier, preferredProvider, streamOptions } = params;

  // Verify conversation belongs to user
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      conversationId,
      role: 'USER',
      content,
    },
  });

  // Get conversation history for context
  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 20, // Keep last 20 messages for context
  });

  // Build messages array for LLM (in chronological order)
  const llmMessages: LLMMessage[] = recentMessages
    .reverse()
    .map((msg) => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant',
      content: msg.content,
    }));

  // Check if this is the first message in the conversation
  const isFirstMessage = recentMessages.length <= 1; // Only the user message we just saved

  // Get AI response
  let aiResponse: string;

  try {
    // 获取今日签文
    const fortune = await getTodayFortune(userId);
    let fortuneSystemPrompt = '';

    console.log('='.repeat(60));
    console.log('📜 今日签文:', fortune ? `${fortune.title} - ${fortune.text}` : '无');
    console.log('💬 用户消息内容:', content);
    console.log('💬 是否首条消息:', isFirstMessage);
    console.log('📊 对话历史消息数:', recentMessages.length);

    // 判断是否应该代入签文
    // 如果是对话的第一条消息，强制代入签文
    const fortuneLimitCheck = await shouldLimitFortune(userId);
    console.log('🚫 签文次数限制:', fortuneLimitCheck ? '已达到上限' : '未达上限');

    const applyFortune = fortune &&
      !fortuneLimitCheck &&
      shouldApplyFortune(content, fortune, isFirstMessage);

    console.log('🎯 是否代入签文:', applyFortune, '原因:', applyFortune ? (isFirstMessage ? '首次对话强制代入' : '已匹配或随机通过') : '未匹配');

    if (applyFortune && fortune) {
      // 生成带入签文的系统提示词
      fortuneSystemPrompt = generateFortuneSystemPrompt(fortune, conversation.mode);
      console.log('✨ 签文系统提示词已生成，长度:', fortuneSystemPrompt.length);
      console.log('📝 签文提示词内容:', fortuneSystemPrompt);

      // 增加代入次数
      await incrementFortuneAppliedCount(userId);
    }

    console.log('='.repeat(60));

    aiResponse = await chatWithLLM(
      llmMessages,
      region,
      tier,
      conversation.mode as ChatMode,
      streamOptions,
      preferredProvider || undefined,
      fortuneSystemPrompt || undefined
    );
  } catch (error) {
    console.error('AI response failed:', error);
    aiResponse = getFallbackErrorMessage();
  }

  // Save assistant message
  const assistantMessage = await prisma.message.create({
    data: {
      conversationId,
      role: 'ASSISTANT',
      content: aiResponse,
      tokens: estimateTokens(aiResponse),
    },
  });

  // Update conversation metadata
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      messageCount: { increment: 1 },
      updatedAt: new Date(),
    },
  });

  return aiResponse;
}

/**
 * Get messages from a conversation
 */
export async function getMessages(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      userId,
    },
  });

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
  }));
}

// ============== Utility Functions ==============

/**
 * Get default title for a conversation based on mode
 */
function getDefaultTitle(mode: ChatMode): string {
  const titles = {
    FRIEND: '和朋友聊天',
    COACH: '成长教练',
    LISTENER: '倾诉时光',
  };
  return titles[mode];
}

/**
 * Get fallback error message when AI fails
 */
function getFallbackErrorMessage(): string {
  const messages = [
    '抱歉，我现在有点困难，请稍后再试试。',
    '嗯...我遇到了一些技术问题。能换个话题或者稍后再聊吗？',
    '抱歉，我需要休息一下。我们可以待会儿继续聊天。',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate a title for the conversation based on first message
 */
export async function generateConversationTitle(
  conversationId: string,
  firstMessage: string
): Promise<string> {
  // Simple title generation (can be improved with AI)
  const maxLength = 30;
  let title = firstMessage.slice(0, maxLength);

  if (firstMessage.length > maxLength) {
    title += '...';
  }

  return title;
}

/**
 * Check if user has reached daily message limit
 */
export async function checkUserLimit(userId: string): Promise<boolean> {
  const today = new Date();
  const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  let usageLimit = await prisma.usageLimit.findUnique({
    where: {
      userId_period: {
        userId,
        period,
      },
    },
  });

  // Create usage limit record if doesn't exist
  if (!usageLimit) {
    usageLimit = await prisma.usageLimit.create({
      data: {
        userId,
        period,
        messageCount: 0,
        vibeCount: 0,
        goalCount: 0,
        tokensUsed: 0,
        resetAt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      },
    });
  }

  // Get user tier to determine limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });

  const FREE_DAILY_LIMIT = 1000; // 临时提高到 1000 次用于测试
  const PRO_DAILY_LIMIT = -1; // Unlimited

  const limit =
    user?.tier === 'PRO' || user?.tier === 'ENTERPRISE'
      ? PRO_DAILY_LIMIT
      : FREE_DAILY_LIMIT;

  // Check if limit reached
  if (limit === -1) return true; // Unlimited
  return usageLimit.messageCount < limit;
}

/**
 * Increment user's message count
 */
export async function incrementMessageCount(userId: string): Promise<void> {
  const today = new Date();
  const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  await prisma.usageLimit.upsert({
    where: {
      userId_period: {
        userId,
        period,
      },
    },
    create: {
      userId,
      period,
      messageCount: 1,
      vibeCount: 0,
      goalCount: 0,
      tokensUsed: 0,
      resetAt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
    },
    update: {
      messageCount: { increment: 1 },
    },
  });
}
