/**
 * Goal Progress Cards Component
 * Displays active goals with progress bars and check-in buttons
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Goal {
  id: string;
  title: string;
  icon: string;
  target: number;
  completed: number;
  unit: string;
}

interface GoalProgressCardsProps {
  goals?: Goal[];
  loading?: boolean;
  onCheckIn?: (goalId: string) => void;
}

export function GoalProgressCards({ goals, loading, onCheckIn }: GoalProgressCardsProps) {
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const handleCheckIn = async (goalId: string) => {
    setCheckingIn(goalId);
    try {
      if (onCheckIn) {
        await onCheckIn(goalId);
      }
      toast.success('打卡成功！继续保持 🎉');
    } catch (error) {
      toast.error('打卡失败，请重试');
    } finally {
      setCheckingIn(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="p-7 bg-white rounded-[24px] border-2 border-border animate-pulse"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <div className="h-5 w-32 bg-muted rounded-2xl"></div>
            </div>
            <div className="h-3 bg-muted rounded-full mb-3"></div>
            <div className="h-4 w-24 bg-muted rounded-xl mb-4"></div>
            <div className="h-10 w-24 bg-muted rounded-2xl"></div>
          </Card>
        ))}
      </div>
    );
  }

  // Demo data if no goals provided
  const demoGoals: Goal[] = goals || [
    {
      id: '1',
      title: '每周运动 4 次',
      icon: '🏃',
      target: 4,
      completed: 3,
      unit: '次'
    },
    {
      id: '2',
      title: '23:30 前睡觉',
      icon: '😴',
      target: 7,
      completed: 4,
      unit: '天'
    }
  ];

  const getProgressColor = (percentage: number) => {
    return percentage >= 80 ? 'from-primary to-primary-light' : 'from-secondary to-secondary-light';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {demoGoals.slice(0, 2).map((goal) => {
        const percentage = Math.round((goal.completed / goal.target) * 100);

        return (
          <Card
            key={goal.id}
            className="p-7 bg-white rounded-[24px] border-2 border-border organic-shadow transition-all hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{goal.icon}</span>
              <h3 className="font-quicksand font-bold text-lg text-foreground flex-1">
                {goal.title}
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  'bg-gradient-to-r',
                  getProgressColor(percentage)
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Progress Text */}
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4 font-quicksand">
              <span>本周已 {goal.completed} {goal.unit}</span>
              <span className="font-bold">{percentage}%</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleCheckIn(goal.id)}
                disabled={checkingIn === goal.id || percentage >= 100}
                className={cn(
                  'rounded-2xl font-quicksand font-bold px-5 organic-shadow transition-all',
                  percentage >= 100
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-primary-light hover:from-primary/90 hover:to-primary-light/90 hover:scale-105'
                )}
              >
                {percentage >= 100 ? '✓ 已完成' : checkingIn === goal.id ? '打卡中...' : '✓ 打卡'}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/goals'}
                className="rounded-2xl border-2 font-quicksand font-bold px-5 hover:border-primary hover:text-primary transition-all"
              >
                查看详情
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
