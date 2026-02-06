/**
 * Vibe Service
 * 处理 Vibe 记录和分析
 */

import { chatWithLLM, type LLMMessage } from '@/lib/ai/providers';
import type { UserRegion, UserTier } from '@/lib/ai/providers';

/**
 * 使用 AI 分析 Vibe 记录
 */
export async function analyzeVibe(
  mood: number,
  energy: number,
  tags: string[],
  note?: string
): Promise<string> {
  // 构建分析提示词
  const moodLabels = ['', '很差', '不好', '一般', '不错', '很好'];
  const energyLabels = ['', '很低', '较低', '一般', '较高', '很高'];

  const systemPrompt = `你是一个温暖、有同理心的心理健康助手。用户刚刚记录了他们当前的状态，你的任务是：
1. 给予理解和共情
2. 提供简短的积极反馈或建议
3. 保持温暖、支持的语气
4. 回复要简洁（50-80字）`;

  const userMessage = `我现在的状态是：
- 心情：${moodLabels[mood]}（${mood}/5）
- 精力：${energyLabels[energy]}（${energy}/5）${tags.length > 0 ? `
- 标签：${tags.join('、')}` : ''}${note ? `
- 备注：${note}` : ''}

请给我一些反馈和建议。`;

  try {
    // 使用默认设置（国际用户，免费层级）
    const response = await chatWithLLM(
      [{ role: 'user', content: userMessage }],
      'international' as UserRegion,
      'FREE' as UserTier,
      'FRIEND',
      undefined,
      undefined,
      systemPrompt
    );

    return response;
  } catch (error) {
    console.error('AI analysis failed:', error);
    // 返回默认反馈
    return getDefaultFeedback(mood, energy);
  }
}

/**
 * 获取默认反馈（AI 失败时使用）
 */
function getDefaultFeedback(mood: number, energy: number): string {
  if (mood <= 2 && energy <= 2) {
    return '感觉你现在状态不太好，记得好好照顾自己。休息一下，或者做些让自己舒服的小事，你值得被温柔对待。💙';
  } else if (mood >= 4 && energy >= 4) {
    return '你的状态很不错！保持这种积极的能量，继续做让你开心的事情吧。记得记录下这些美好的时刻。✨';
  } else if (mood >= 4) {
    return '心情很好呢！不过精力看起来需要补充一下。在保持好心情的同时，也别忘了照顾好自己的身体。😊';
  } else if (energy <= 2) {
    return '看起来你需要补充一些能量。不管是身体上的休息，还是精神上的放松，都请给自己一点时间。慢慢来，不着急。💪';
  } else {
    return '感谢你记录下此刻的状态。关注自己的感受是一件很棒的事情，继续保持这种自我觉察吧。🌟';
  }
}

/**
 * 计算 Vibe Score
 * 基于心情和精力的加权平均
 */
export function calculateVibeScore(mood: number, energy: number): number {
  // 心情占 60%，精力占 40%
  return Math.round((mood * 0.6 + energy * 0.4) * 20) / 20; // 保留两位小数
}

/**
 * 获取 Vibe 趋势分析
 */
export async function getVibeTrends(userId: string, days: number = 7) {
  const { prisma } = await import('@/lib/prisma');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const records = await prisma.vibeRecord.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (records.length === 0) {
    return {
      averageMood: 0,
      averageEnergy: 0,
      averageScore: 0,
      trend: 'stable',
      dailyAverages: [],
    };
  }

  // 计算平均值
  const totalMood = records.reduce((sum, r) => sum + r.mood, 0);
  const totalEnergy = records.reduce((sum, r) => sum + r.energy, 0);
  const totalScore = records.reduce((sum, r) => sum + calculateVibeScore(r.mood, r.energy), 0);

  const averageMood = Math.round((totalMood / records.length) * 10) / 10;
  const averageEnergy = Math.round((totalEnergy / records.length) * 10) / 10;
  const averageScore = Math.round((totalScore / records.length) * 10) / 10;

  // 分析趋势
  const recentHalf = records.slice(Math.floor(records.length / 2));
  const oldHalf = records.slice(0, Math.floor(records.length / 2));

  const recentAvg = recentHalf.reduce((sum, r) => sum + r.mood, 0) / recentHalf.length;
  const oldAvg = oldHalf.reduce((sum, r) => sum + r.mood, 0) / oldHalf.length;

  let trend = 'stable';
  if (recentAvg - oldAvg > 0.5) {
    trend = 'improving';
  } else if (recentAvg - oldAvg < -0.5) {
    trend = 'declining';
  }

  // 按日期分组计算每日平均值
  const dailyMap = new Map<string, { mood: number; energy: number; count: number }>();

  records.forEach(record => {
    const dateKey = record.createdAt.toISOString().split('T')[0];
    const existing = dailyMap.get(dateKey) || { mood: 0, energy: 0, count: 0 };
    dailyMap.set(dateKey, {
      mood: existing.mood + record.mood,
      energy: existing.energy + record.energy,
      count: existing.count + 1,
    });
  });

  const dailyAverages = Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    mood: Math.round((data.mood / data.count) * 10) / 10,
    energy: Math.round((data.energy / data.count) * 10) / 10,
    score: Math.round((calculateVibeScore(data.mood / data.count, data.energy / data.count)) * 10) / 10,
  }));

  return {
    averageMood,
    averageEnergy,
    averageScore,
    trend,
    dailyAverages,
  };
}
