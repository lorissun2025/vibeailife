/**
 * Mobile Bottom Navigation Component
 * Bottom tab bar for mobile devices with 4 main navigation items
 */

'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: '🏠', label: '首页', href: '/dashboard' },
  { id: 'record', icon: '📝', label: '记录', href: '/vibe?mode=record' },
  { id: 'chat', icon: '💬', label: '对话', href: '/chat' },
  { id: 'report', icon: '📊', label: '报告', href: '/vibe' },
];

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Get active route
  const getActiveId = () => {
    if (pathname?.startsWith('/chat')) return 'chat';
    if (pathname?.startsWith('/vibe')) return 'report';
    if (pathname?.startsWith('/goals')) return 'home';
    return 'home';
  };

  const activeId = getActiveId();

  return (
    <nav
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0',
        'bg-white border-t-2 border-border',
        'flex justify-around items-center',
        'py-2 pb-safe',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
        'z-50',
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = activeId === item.id;

        return (
          <a
            key={item.id}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1',
              'px-4 py-2 rounded-2xl',
              'transition-all duration-200',
              'hover:bg-accent/20',
              isActive && 'text-primary'
            )}
          >
            <span className="text-2xl">{item.icon}</span>
            <span
              className={cn(
                'text-xs font-quicksand font-semibold whitespace-nowrap',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
