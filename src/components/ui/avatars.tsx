/**
 * Avatar Components
 * User and Bot avatars for chat interface
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function UserAvatar({ className, ...props }: React.ComponentProps<typeof Avatar>) {
  return (
    <Avatar className={className} {...props}>
      <AvatarImage src="" />
      <AvatarFallback className="bg-blue-500 text-white">你</AvatarFallback>
    </Avatar>
  );
}

export function BotAvatar({ className, ...props }: React.ComponentProps<typeof Avatar>) {
  return (
    <Avatar className={className} {...props}>
      <AvatarImage src="" />
      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        AI
      </AvatarFallback>
    </Avatar>
  );
}
