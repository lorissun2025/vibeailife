/**
 * Fortune Service
 * 处理签文相关的业务逻辑
 */

import { prisma } from '@/lib/prisma';

export interface FortuneContext {
  fortuneId: string;
  title: string;
  text: string;
  interpretation: string;
  applicableScenarios: string[];
  aiHints: string[];
  tone: string;
}

/**
 * 获取用户今日签文
 */
export async function getTodayFortune(userId: string): Promise<FortuneContext | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyFortune = await prisma.dailyFortune.findUnique({
    where: {
      userId_drawDate: {
        userId,
        drawDate: today,
      },
    },
    include: {
      fortune: true,
    },
  });

  // 如果没有抽签或已跳过，返回 null
  if (!dailyFortune || !dailyFortune.fortuneId || dailyFortune.skipped) {
    return null;
  }

  return {
    fortuneId: dailyFortune.fortune.id,
    title: dailyFortune.fortune.title,
    text: dailyFortune.fortune.text,
    interpretation: dailyFortune.fortune.interpretation,
    applicableScenarios: dailyFortune.fortune.applicableScenarios,
    aiHints: dailyFortune.fortune.aiHints,
    tone: dailyFortune.fortune.tone,
  };
}

/**
 * 检测用户消息是否适用签文
 * 简单的关键词匹配算法
 * @param userMessage 用户消息内容
 * @param fortune 签文上下文
 * @param forceApply 是否强制代入（用于首次对话）
 */
export function shouldApplyFortune(userMessage: string, fortune: FortuneContext, forceApply = false): boolean {
  if (!fortune) {
    return false;
  }

  // 如果强制代入，直接返回 true
  if (forceApply) {
    console.log('✅ 签文强制代入（首次对话）');
    return true;
  }

  // 1. 检查消息是否包含签文适用场景的关键词
  const lowerMessage = userMessage.toLowerCase();

  // 简单的关键词匹配
  const scenarioKeywords: Record<string, string[]> = {
    '焦虑': ['焦虑', '着急', '担心', '紧张', '不安', '压力', '累'],
    '困难': ['困难', '挫折', '失败', '问题', '麻烦', '挑战'],
    '迷茫': ['迷茫', '困惑', '不知道', '不确定'],
    '孤独': ['孤独', '孤单', '一个人', '没人'],
    '社交': ['朋友', '人际关系', '社交', '同事'],
    '工作': ['工作', '职业', '事业', '公司', '老板'],
    '学习': ['学习', '进步', '提升', '成长'],
    '耐心': ['耐心', '等待', '急', '慢'],
    '动力': ['动力', '激励', '坚持', '放弃'],
    // 添加通用问候语
    '问候': ['你好', '早上好', '下午好', '晚上好', '嗨', 'hello', 'hi'],
  };

  // 检查是否匹配任何适用场景
  for (const scenario of fortune.applicableScenarios) {
    const keywords = scenarioKeywords[scenario];
    if (keywords) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          console.log('✅ 签文匹配成功:', scenario, '关键词:', keyword);
          return true;
        }
      }
    }
  }

  // 2. 如果没有明确匹配，使用随机概率 (提高到 70%)
  const shouldApply = Math.random() < 0.7;
  console.log('🎲 签文随机概率:', shouldApply ? '代入' : '不代入');

  return shouldApply;
}

/**
 * 生成带入签文的系统提示词
 */
export function generateFortuneSystemPrompt(fortune: FortuneContext, chatMode: string): string {
  const basePrompt = `今日签文是"${fortune.title}"："${fortune.text}"。

解读：${fortune.interpretation}

**重要指示**：
1. 在对话中巧妙、自然地融入签文的含义
2. 不要生硬地提及签文，而是将签文的智慧融入你的回复中
3. 根据用户的情绪和话题，判断是否适合提及签文
4. 如果适用，用1-2句话点到为止，不要过度解释
5. 保持对话的自然流畅，签文应该是锦上添花，而不是主角`;

  // 根据签文的语气调整提示
  const toneInstructions: Record<string, string> = {
    ENCOURAGING: '以鼓励、支持的语气，给予用户信心和力量',
    REFLECTIVE: '以反思、启发的语气，引导用户深入思考',
    CALMING: '以平静、安抚的语气，帮助用户放松和接纳',
    INSPIRING: '以启发、激励的语气，激发用户的潜能和动力',
    WARM: '以温暖、关怀的语气，给予用户温暖和支持',
  };

  const toneInstruction = toneInstructions[fortune.tone] || '';

  return `${basePrompt}

${toneInstruction}

**今日签文提示**：${fortune.aiHints.join('、')}`;
}

/**
 * 增加签文代入次数
 */
export async function incrementFortuneAppliedCount(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyFortune.update({
    where: {
      userId_drawDate: {
        userId,
        drawDate: today,
      },
    },
    data: {
      appliedCount: {
        increment: 1,
      },
    },
  });
}

/**
 * 检查今日签文代入次数是否超限
 */
export async function shouldLimitFortune(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyFortune = await prisma.dailyFortune.findUnique({
    where: {
      userId_drawDate: {
        userId,
        drawDate: today,
      },
    },
    select: {
      appliedCount: true,
    },
  });

  // 每天最多代入 5 次
  const MAX_DAILY_APPLIED = 5;

  return (dailyFortune?.appliedCount || 0) >= MAX_DAILY_APPLIED;
}
