/**
 * Chat Page
 * Main chat interface with conversation list and message area
 */

import { ChatLayout } from '@/components/chat/chat-layout';

export default async function ChatPage() {
  // TODO: Implement session check with NextAuth v5
  // For now, allow access for testing
  const user = {
    id: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    tier: 'FREE',
    hasOnboarded: true,
    region: 'international',
  };

  return <ChatLayout user={user} />;
}
