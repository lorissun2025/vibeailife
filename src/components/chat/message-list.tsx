/**
 * Message List Component
 * Displays messages in the chat area
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { FortuneHighlight } from './fortune-highlight';
import { cn } from '@/lib/utils';

export type MessageRole = 'USER' | 'ASSISTANT';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  fortuneData?: {
    title: string;
    text: string;
    interpretation: string;
  };
}

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  streamingContent?: string;
  currentFortune?: {
    title: string;
    text: string;
    interpretation: string;
  } | null;
}

export function MessageList({ messages, isLoading, streamingContent, currentFortune }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isScrolledToBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isScrolledToBottom]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsScrolledToBottom(isAtBottom);
  };

  return (
    <ScrollArea className="flex-1 bg-gradient-to-b from-background to-background/50" ref={scrollRef} onScroll={handleScroll}>
      <div className="p-6 space-y-6">
        {messages.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 organic-shadow">
              <span className="text-4xl">💬</span>
            </div>
            <p className="text-xl font-quicksand font-bold text-foreground mb-2">开始新对话</p>
            <p className="text-sm text-center max-w-md">选择一个对话模式，然后发送消息开始聊天 ✨</p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Check if this is the first assistant message
            const isFirstAssistantMessage = message.role === 'ASSISTANT' &&
              messages.slice(0, index).every(m => m.role !== 'ASSISTANT');

            return (
              <div key={message.id}>
                {/* Show fortune card before the first assistant message */}
                {isFirstAssistantMessage && currentFortune && (
                  <FortuneHighlight>
                    <div className="space-y-2">
                      <p className="text-base font-quicksand font-bold text-primary">{currentFortune.title}</p>
                      <p className="text-sm italic text-foreground/90">"{currentFortune.text}"</p>
                      <p className="text-sm text-muted-foreground mt-2">{currentFortune.interpretation}</p>
                    </div>
                  </FortuneHighlight>
                )}
                <MessageBubble message={message} />
              </div>
            );
          })
        )}

        {/* Streaming message */}
        {streamingContent && (
          <>
            <MessageBubble
              message={{
                id: 'streaming',
                role: 'ASSISTANT',
                content: streamingContent,
                createdAt: new Date(),
              }}
              isStreaming
            />
          </>
        )}

        {/* Loading indicator */}
        {isLoading && <LoadingIndicator />}
      </div>
    </ScrollArea>
  );
}

function MessageBubble({
  message,
  isStreaming = false,
}: {
  message: ChatMessage;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'USER';

  return (
    <div className={cn('flex gap-4', isUser && 'justify-end')}>
      {/* Avatar (only for assistant) */}
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 organic-shadow">
          <span className="text-lg">🤖</span>
        </div>
      )}

      {/* Message content */}
      <Card
        className={cn(
          'max-w-[70%] p-4 border-2',
          isUser
            ? 'bg-gradient-to-br from-primary to-primary/80 text-white border-primary rounded-2xl rounded-br-md'
            : 'bg-white text-foreground border-border rounded-2xl rounded-bl-md organic-shadow'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </p>
        {/* Streaming cursor */}
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse rounded-full" />
        )}
      </Card>

      {/* Avatar (only for user) */}
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center flex-shrink-0 organic-shadow">
          <span className="text-lg">😊</span>
        </div>
      )}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 organic-shadow">
        <span className="text-lg">🤖</span>
      </div>
      <Card className="bg-white border-border border-2 p-4 rounded-2xl organic-shadow">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-gradient-to-br from-primary to-primary/80 rounded-full animate-bounce organic-shadow" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-full animate-bounce organic-shadow" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-gradient-to-br from-accent to-accent/80 rounded-full animate-bounce organic-shadow" style={{ animationDelay: '300ms' }} />
        </div>
      </Card>
    </div>
  );
}
