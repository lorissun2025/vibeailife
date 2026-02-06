/**
 * Conversation List Component
 * Displays list of conversations in the sidebar
 */

'use client';

import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusIcon, MessageIcon, TrashIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  mode: 'FRIEND' | 'COACH' | 'LISTENER';
  title: string | null;
  messageCount: number;
  updatedAt: Date;
  createdAt: Date;
}

interface ConversationListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect, onNew, onDelete }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations?limit=50');
      const data = await response.json();
      if (data.success) {
        setConversations(data.data.conversations);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click event on the button

    if (!confirm('确定要删除这条对话吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        // Remove from local state
        setConversations((prev) => prev.filter((c) => c.id !== id));

        // If the deleted conversation was selected, clear selection
        if (selectedId === id && onDelete) {
          onDelete(id);
        }
      } else {
        alert('删除失败：' + (data.error?.message || '未知错误'));
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('zh-CN', { weekday: 'short' });
    } else {
      return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  const formatStartDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } else if (diffDays < 365) {
      return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    } else {
      return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'FRIEND':
        return '😊';
      case 'COACH':
        return '💪';
      case 'LISTENER':
        return '👂';
      default:
        return '💬';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b-2 border-border bg-white">
        <h2 className="text-lg font-quicksand font-bold text-foreground">历史对话记录</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={onNew}
          className="rounded-2xl hover:bg-accent/20 p-2"
        >
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-quicksand">加载中...</span>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                <MessageIcon className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-quicksand font-medium">还没有对话</p>
              <p className="text-xs mt-2">点击 + 开始新对话 ✨</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'relative group rounded-2xl transition-all border-2',
                  selectedId === conv.id
                    ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary organic-shadow'
                    : 'bg-white border-transparent hover:border-border hover:bg-accent/5'
                )}
              >
                <button
                  onClick={() => onSelect(conv.id)}
                  className="w-full text-left p-4 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    {/* Mode Icon */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 text-xl">
                      {getModeIcon(conv.mode)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold font-quicksand truncate text-foreground">
                          {conv.title || '新对话'}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2 font-quicksand">
                          {formatDate(conv.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground font-quicksand">
                          {conv.messageCount} 条消息
                        </p>
                        <p className="text-xs text-muted-foreground font-quicksand">
                          {formatStartDate(conv.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-white border-2 border-border hover:border-accent hover:bg-accent/20"
                  title="删除对话"
                >
                  <TrashIcon className="w-4 h-4 text-muted-foreground hover:text-accent" />
                </button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
