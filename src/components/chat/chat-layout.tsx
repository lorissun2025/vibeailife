/**
 * Chat Layout Component
 * Main chat interface layout that combines all chat components
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationList } from './conversation-list';
import { MessageList, type ChatMessage } from './message-list';
import { MessageInput } from './message-input';
import { ChatModeSwitcher, type ChatMode } from './chat-mode-switcher';
import { FortuneHighlight } from './fortune-highlight';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/ui/icons';

interface FortuneData {
  title: string;
  text: string;
  interpretation: string;
}

type LLMProvider = 'openai' | 'zhipu' | null;

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  tier?: string;
  region?: string;
}

export function ChatLayout({ user }: { user: User }) {
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentMode, setCurrentMode] = useState<ChatMode>('FRIEND');
  const [preferredProvider, setPreferredProvider] = useState<LLMProvider>(null);
  const [currentFortune, setCurrentFortune] = useState<FortuneData | null>(null);

  // Load user's preferred provider on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/user/settings');
        const result = await response.json();
        if (result.success) {
          setPreferredProvider(result.data.preferredProvider as LLMProvider);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    loadSettings();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    } else {
      setMessages([]);
    }
  }, [selectedConversationId]);

  // Check URL params for conversation ID
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get('conversation');
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }

    // Check if coming from fortune draw
    const fromFortune = params.get('fromFortune');
    if (fromFortune === 'true' && !conversationId) {
      // Auto-create conversation and trigger AI greeting with fortune
      setTimeout(() => {
        triggerFortuneGreeting();
      }, 500);
    }
  }, []);

  // Trigger AI greeting with fortune
  const triggerFortuneGreeting = async () => {
    try {
      // Create new conversation
      const newConv = await createConversation();
      setSelectedConversationId(newConv.id);

      // Send a message that will trigger AI to mention the fortune
      // Using keywords that match fortune scenarios (焦虑, 困惑, etc.)
      await handleSendMessage('早上好，今天心情怎么样？');
    } catch (error) {
      console.error('Failed to trigger fortune greeting:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    // If no conversation selected, create one first
    let conversationId = selectedConversationId;
    if (!conversationId) {
      const newConv = await createConversation();
      conversationId = newConv.id;
      setSelectedConversationId(conversationId);
    }

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Send message and stream response
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const response = await fetch(
        `/api/chat/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.error?.code === 'RATE_LIMIT_EXCEEDED') {
          alert(error.error.message);
          // Remove user message
          setMessages((prev) => prev.slice(0, -1));
          setIsStreaming(false);
          return;
        }
        throw new Error('Failed to send message');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.chunk) {
                  fullResponse += data.chunk;
                  setStreamingContent(fullResponse);
                }

                if (data.done) {
                  // Check if fortune data is included
                  if (data.fortune) {
                    console.log('🎉 收到签文数据:', data.fortune);
                    setCurrentFortune(data.fortune);
                  } else {
                    console.log('⚠️ 没有签文数据');
                  }

                  // Add assistant message
                  const assistantMessage: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: 'ASSISTANT',
                    content: data.full || fullResponse,
                    createdAt: new Date(),
                  };
                  setMessages((prev) => [...prev, assistantMessage]);
                  setStreamingContent('');
                  setIsStreaming(false);
                }

                if (data.error) {
                  console.error('Stream error:', data.error);
                  setIsStreaming(false);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const createConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: currentMode,
        }),
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to create conversation');
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  };

  const handleNewConversation = async () => {
    setSelectedConversationId(null);
    setMessages([]);
    setCurrentMode('FRIEND');
    setCurrentFortune(null);
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // Update URL without triggering navigation
    const url = new URL(window.location.href);
    url.searchParams.set('conversation', id);
    window.history.replaceState({}, '', url.toString());
  };

  const handleDeleteConversation = (id: string) => {
    // If the deleted conversation was selected, clear the view
    if (selectedConversationId === id) {
      handleNewConversation();
    }
  };

  const handleModeChange = (mode: ChatMode) => {
    setCurrentMode(mode);
    // If in existing conversation, warn about mode change
    if (selectedConversationId && messages.length > 0) {
      if (confirm('切换模式将创建新对话，确定吗？')) {
        handleNewConversation();
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Conversation List */}
      <div className="w-80 border-r-2 border-border bg-white/50 backdrop-blur-sm flex-shrink-0">
        <ConversationList
          selectedId={selectedConversationId || undefined}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-border bg-white organic-shadow">
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="rounded-2xl hover:bg-accent/20"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
            <ChatModeSwitcher
              currentMode={currentMode}
              onModeChange={handleModeChange}
              disabled={isStreaming}
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Provider indicator */}
            <div className="text-sm text-muted-foreground flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
              <span className="text-xs">AI:</span>
              <span className="font-bold font-quicksand text-primary">
                {preferredProvider === 'zhipu' ? '智谱' : preferredProvider === 'openai' ? 'GPT' : '自动'}
              </span>
            </div>
            {/* Settings link */}
            <a
              href="/settings"
              className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-2xl hover:bg-accent/20"
              title="设置"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
            <div className="text-sm">
              {user.tier === 'FREE' && <span className="text-xs font-quicksand font-medium px-3 py-1.5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">免费版 • 10条/天</span>}
              {user.tier === 'PRO' && <span className="text-xs font-quicksand font-bold px-3 py-1.5 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full">Pro 会员</span>}
              {user.tier === 'ENTERPRISE' && <span className="text-xs font-quicksand font-bold px-3 py-1.5 bg-gradient-to-br from-secondary to-secondary/80 rounded-full">企业版</span>}
            </div>
          </div>
        </div>

        {/* Messages */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          streamingContent={streamingContent}
          currentFortune={currentFortune}
        />

        {/* Input */}
        <MessageInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={selectedConversationId ? '输入消息...' : '输入消息开始新对话...'}
        />
      </div>
    </div>
  );
}
