/**
 * Fortune Highlight Component
 * Displays fortune card when AI mentions fortune in conversation
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FortuneHighlightProps {
  children: React.ReactNode;
  className?: string;
}

export function FortuneHighlight({ children, className }: FortuneHighlightProps) {
  return (
    <div
      className={cn(
        'my-4 p-4 rounded-2xl',
        'bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10',
        'border-2 border-primary/30',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-secondary/20 to-transparent rounded-tr-full"></div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">📜</span>
          <div className="flex-1">
            <div className="text-sm font-quicksand font-medium text-primary/80 mb-1">
              今日签文
            </div>
            <div className="text-base leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
