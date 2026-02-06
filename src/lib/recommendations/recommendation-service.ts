/**
 * Recommendation Service
 * 智能推荐系统
 */

import { prisma } from '@/lib/prisma';

export interface Recommendation {
  id: string
  type: 'vibe_tip' | 'goal_suggestion' | 'wellness_activity' | 'mindfulness_practice'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

/**
 * 基于用户状态生成个性化推荐
 */
export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // 获取用户最近的 Vibe 记录
  const recentVibes = await prisma.vibeRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 7,
  });

  // 获取用户的目标
  const activeGoals = await prisma.goal.findMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
  });

  // 分析 Vibe 趋势
  if (recentVibes.length > 0) {
    const avgMood = recentVibes.reduce((sum, v) => sum + v.mood, 0) / recentVibes.length;
    const avgEnergy = recentVibes.reduce((sum, v) => sum + v.energy, 0) / recentVibes.length;

    // 低心情推荐
    if (avgMood < 3) {
      recommendations.push({
        id: 'vibe-low-mood',
        type: 'wellness_activity',
        title: '心情低落时的活动建议',
        description: '试试这些活动：听喜欢的音乐、散步10分钟、和朋友聊天、或者写日记。记住，不好也没关系。',
        priority: 'high',
      });
    }

    // 低精力推荐
    if (avgEnergy < 3) {
      recommendations.push({
        id: 'vibe-low-energy',
        type: 'mindfulness_practice',
        title: '恢复精力的冥想练习',
        description: '尝试5分钟的深呼吸冥想，或者短暂的小睡。恢复精力是提升效率的关键。',
        priority: 'high',
      });
    }

    // 高压力标签检测
    const stressTags = recentVibes.flatMap(v => v.tags).filter(t =>
      ['工作', '压力', '焦虑', '忙'].includes(t)
    );

    if (stressTags.length > 2) {
      recommendations.push({
        id: 'stress-relief',
        type: 'mindfulness_practice',
        title: '压力缓解建议',
        description: '你最近似乎压力较大。建议：设置工作边界、每天安排30分钟"me time"、试试正念冥想。',
        priority: 'high',
      });
    }
  }

  // 目标相关推荐
  if (activeGoals.length > 0) {
    const stalledGoals = activeGoals.filter(g => g.progress < 30);

    if (stalledGoals.length > 0) {
      recommendations.push({
        id: 'goal-stalled',
        type: 'goal_suggestion',
        title: '目标推进建议',
        description: `你有 ${stalledGoals.length} 个目标进度较慢。建议：将大目标拆解成小步骤、设置提醒、找一个伙伴互相监督。`,
        priority: 'medium',
      });
    }

    // 即将到期的目标
    const now = new Date();
    const upcomingDeadlines = activeGoals.filter(g => {
      if (!g.deadline) return false;
      const daysUntilDeadline = Math.ceil((new Date(g.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline > 0 && daysUntilDeadline <= 7;
    });

    if (upcomingDeadlines.length > 0) {
      recommendations.push({
        id: 'goal-deadline',
        type: 'goal_suggestion',
        title: '目标即将到期',
        description: `你有 ${upcomingDeadlines.length} 个目标即将到期。现在开始行动，还来得及完成！`,
        priority: 'high',
      });
    }
  }

  // 通用健康建议
  if (recentVibes.length < 3) {
    recommendations.push({
      id: 'vibe-tracking-reminder',
      type: 'vibe_tip',
      title: '记录 Vibe 的重要性',
      description: '持续记录 Vibe 可以帮助你更好地了解自己的情绪模式。建议每天至少记录一次。',
      priority: 'low',
    });
  }

  // 每日签文提醒
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayFortune = await prisma.dailyFortune.findUnique({
    where: {
      userId_drawDate: { userId, drawDate: today },
    },
  });

  if (!todayFortune || todayFortune.skipped) {
    recommendations.push({
      id: 'fortune-reminder',
      type: 'wellness_activity',
      title: '今日签文等待抽取',
      description: '今天的签文可能给你带来启发。抽一支签，为今天注入新的能量吧！',
      priority: 'medium',
    });
  }

  // 按优先级排序
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return recommendations.slice(0, 5); // 最多返回5条推荐
}
