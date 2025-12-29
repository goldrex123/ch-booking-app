'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* 데스크톱 사이드바 */}
        <aside className="hidden w-64 md:block">
          <Sidebar />
        </aside>

        {/* 모바일 사이드바 */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto bg-muted/10">
          <div className="container px-4 py-6 md:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
