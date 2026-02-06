/**
 * Message Input Component
 * Text input for sending messages
 */

'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = '输入消息...',
  minLength = 1,
  maxLength = 2000,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSend = () => {
    const trimmed = content.trim();
    if (trimmed.length >= minLength && trimmed.length <= maxLength) {
      onSend(trimmed);
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = content.trim().length >= minLength && !disabled;

  return (
    <div className="p-6 border-t-2 border-border bg-white/50 backdrop-blur-sm">
      <div className="flex gap-3 items-end max-w-4xl mx-auto">
        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            maxLength={maxLength}
            className={cn(
              'min-h-[52px] max-h-[200px] resize-none rounded-2xl border-2',
              'px-5 py-3 bg-white',
              'focus:border-primary focus:ring-4 focus:ring-primary/10',
              'transition-all',
              'pr-14' // Space for character count
            )}
          />
          {/* Character count */}
          {content.length > maxLength * 0.8 && (
            <div
              className={cn(
                'absolute bottom-3 right-3 text-xs font-quicksand font-medium',
                content.length >= maxLength
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              )}
            >
              {content.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'h-12 w-12 flex-shrink-0 rounded-2xl organic-shadow transition-all',
            canSend && 'bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
            !canSend && 'bg-gray-100'
          )}
        >
          <SendIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground max-w-4xl mx-auto">
        <p className="font-quicksand">按 Enter 发送，Shift + Enter 换行 ✨</p>
      </div>
    </div>
  );
}
