/**
 * Desktop Bottom Bar Component
 * Floating bottom bar with primary action button for desktop layout
 */

'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopBottomBarProps {
  className?: string;
}

export function DesktopBottomBar({ className }: DesktopBottomBarProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t-2 border-border py-5 px-6',
        'flex justify-center items-center gap-5',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50',
        className
      )}
    >
      <Button
        onClick={() => window.location.href = '/chat'}
        className={cn(
          'flex items-center gap-3 px-8 py-4 rounded-[20px]',
          'bg-gradient-to-r from-primary to-primary-light',
          'text-white font-quicksand font-bold text-base',
          'organic-shadow transition-all',
          'hover:scale-105 hover:shadow-lg'
        )}
      >
        <MessageCircle className="w-5 h-5" />
        开始对话
      </Button>
    </div>
  );
}
