/**
 * Chat Mode Switcher Component
 * Allows switching between Friend, Coach, and Listener modes
 */

'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type ChatMode = 'FRIEND' | 'COACH' | 'LISTENER';

interface ChatModeSwitcherProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const MODES = {
  FRIEND: {
    label: '朋友',
    icon: '😊',
    description: '像朋友一样轻松聊天',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  COACH: {
    label: '教练',
    icon: '💪',
    description: '获得成长建议和指导',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  LISTENER: {
    label: '倾听者',
    icon: '👂',
    description: '倾诉你的心声',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    borderColor: 'border-green-300 dark:border-green-700',
  },
};

export function ChatModeSwitcher({
  currentMode,
  onModeChange,
  disabled = false,
}: ChatModeSwitcherProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a simple placeholder during SSR
    return (
      <div className="flex items-center gap-2">
        <div className="flex gap-1 px-3 py-2 bg-gray-100 rounded-lg">
          <span className="text-sm">😊 朋友</span>
          <span className="text-sm">💪 教练</span>
          <span className="text-sm">👂 倾听</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Compact Mode Selector */}
      <Tabs value={currentMode} onValueChange={(v) => onModeChange(v as ChatMode)}>
        <TabsList className="grid w-full grid-cols-3">
          {Object.entries(MODES).map(([mode, config]) => (
            <TabsTrigger
              key={mode}
              value={mode}
              disabled={disabled}
              className="data-[state=active]:bg-transparent"
            >
              <span className="mr-1">{config.icon}</span>
              {config.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Info Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShowDetails(true)}
        className="text-gray-500"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </Button>

      {/* Mode Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>选择聊天模式</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.entries(MODES).map(([mode, config]) => (
              <button
                key={mode}
                onClick={() => {
                  onModeChange(mode as ChatMode);
                  setShowDetails(false);
                }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                  'hover:shadow-md',
                  currentMode === mode
                    ? `${config.color} ${config.borderColor} border-current`
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                <span className="text-3xl">{config.icon}</span>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold mb-1">{config.label}模式</h3>
                  <p className="text-sm opacity-80">{config.description}</p>
                </div>
                {currentMode === mode && (
                  <div className="w-6 h-6 rounded-full bg-current opacity-20 flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
