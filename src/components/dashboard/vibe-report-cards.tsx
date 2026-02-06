/**
 * Vibe Report Cards Component
 * Displays weekly vibe report insights (progress, attention, discoveries)
 */

'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface VibeReportData {
  progress: {
    sleep: string;
    exercise: string;
    social: string;
  };
  attention: {
    warnings: string[];
  };
  discoveries: {
    insights: string[];
  };
}

interface VibeReportCardsProps {
  data?: VibeReportData;
  loading?: boolean;
}

export function VibeReportCards({ data, loading }: VibeReportCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="p-7 bg-white rounded-[24px] border-2 border-border animate-pulse"
          >
            <div className="h-8 w-8 bg-muted rounded-full mb-4"></div>
            <div className="h-6 w-24 bg-muted rounded-2xl mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted rounded-xl"></div>
              <div className="h-4 w-3/4 bg-muted rounded-xl"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-12 animate-fade-in-up">
      {/* Progress Card */}
      <Card className="p-7 bg-gradient-to-br from-secondary/15 to-secondary/5 rounded-[24px] border-2 border-secondary organic-shadow transition-all hover:-translate-y-1 bounce-hover">
        <div className="text-3xl mb-4">✅</div>
        <h3 className="font-quicksand font-bold text-xl mb-4 text-foreground">进步</h3>
        <ul className="text-sm text-muted-foreground space-y-2.5">
          <li>
            • 睡眠平均 +45 分钟{' '}
            <span className="text-secondary font-bold">
              6.2h → 7.1h
            </span>
          </li>
          <li>
            • 运动频率: 4 次/周{' '}
            <span className="text-secondary">↑ 2 次</span>
          </li>
          <li>• 社交能量提升</li>
        </ul>
      </Card>

      {/* Attention Card */}
      <Card className="p-7 bg-gradient-to-br from-accent/15 to-accent/5 rounded-[24px] border-2 border-accent organic-shadow transition-all hover:-translate-y-1 bounce-hover">
        <div className="text-3xl mb-4">⚠️</div>
        <h3 className="font-quicksand font-bold text-xl mb-4 text-foreground">注意</h3>
        <ul className="text-sm text-muted-foreground space-y-2.5">
          <li>
            • 周三压力值最高{' '}
            <span className="text-accent font-bold">(8.2/10)</span>
          </li>
          <li>• 建议周三安排更多休息</li>
          <li>• 深夜工作频率增加</li>
        </ul>
      </Card>

      {/* Discovery Card */}
      <Card className="p-7 bg-gradient-to-br from-primary/15 to-primary/5 rounded-[24px] border-2 border-primary organic-shadow transition-all hover:-translate-y-1 bounce-hover">
        <div className="text-3xl mb-4">💡</div>
        <h3 className="font-quicksand font-bold text-xl mb-4 text-foreground">发现</h3>
        <ul className="text-sm text-muted-foreground space-y-2.5">
          <li>• 运动日的情绪评分平均高 1.8 分</li>
          <li>• 睡眠 {'<'} 7h 时，工作效率下降 40%</li>
          <li>• 社交后精力值持续增长</li>
        </ul>
        <button
          onClick={() => window.location.href = '/vibe'}
          className="mt-4 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-quicksand font-bold rounded-2xl organic-shadow hover:from-primary/90 hover:to-primary-light/90 transition-all hover:scale-105 text-sm"
        >
          查看详细报告 →
        </button>
      </Card>
    </div>
  );
}
