import { redirect } from 'next/navigation';

/**
 * 대시보드 루트 페이지
 * /dashboard로 접속 시 예약 조회 페이지로 리다이렉트
 */
export default function DashboardPage() {
  redirect('/dashboard/bookings');
}
