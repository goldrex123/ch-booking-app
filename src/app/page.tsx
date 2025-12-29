'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 이미 로그인된 경우 예약 조회 페이지로 리다이렉트
    if (isAuthenticated) {
      router.push('/dashboard/bookings');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            부속실 및 차량 예약 시스템
          </h1>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            효율적인 자원 관리를 위한 통합 예약 플랫폼
          </p>
        </div>
        <LoginForm />
      </main>
    </div>
  );
}
