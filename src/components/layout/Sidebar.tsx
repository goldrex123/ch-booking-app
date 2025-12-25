'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Car,
  Building,
  CarFront,
  DoorOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    title: '대시보드',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '예약 조회',
    href: '/dashboard/bookings',
    icon: Calendar,
  },
  {
    title: '차량 예약',
    href: '/dashboard/vehicle-booking',
    icon: CarFront,
  },
  {
    title: '부속실 예약',
    href: '/dashboard/room-booking',
    icon: DoorOpen,
  },
  {
    title: '차량 관리',
    href: '/dashboard/vehicles',
    icon: Car,
  },
  {
    title: '부속실 관리',
    href: '/dashboard/rooms',
    icon: Building,
  },
];

interface SidebarProps {
  className?: string;
}

/**
 * 사이드바 컴포넌트
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn('flex h-full flex-col border-r bg-background', className)}>
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
