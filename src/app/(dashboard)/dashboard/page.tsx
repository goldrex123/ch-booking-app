'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Car, Building, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useRoomStore } from '@/store/roomStore';
import { bookingApi } from '@/lib/api/bookings';
import { vehicleApi } from '@/lib/api/vehicles';
import { roomApi } from '@/lib/api/rooms';

/**
 * 대시보드 홈 페이지
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const { vehicles, setVehicles } = useVehicleStore();
  const { rooms, setRooms } = useRoomStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [bookingsResult, vehiclesResult, roomsResult] = await Promise.all([
          bookingApi.getAll(),
          vehicleApi.getAll(),
          roomApi.getAll(),
        ]);

        if (bookingsResult.success && bookingsResult.data) {
          setBookings(bookingsResult.data);
        }
        if (vehiclesResult.success && vehiclesResult.data) {
          setVehicles(vehiclesResult.data);
        }
        if (roomsResult.success && roomsResult.data) {
          setRooms(roomsResult.data);
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [setBookings, setVehicles, setRooms]);

  const myBookings = bookings.filter((b) => b.userId === user?.id);
  const pendingBookings = myBookings.filter((b) => b.status === 'pending');
  const upcomingBookings = myBookings
    .filter((b) => b.status === 'approved' && new Date(b.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-muted-foreground">
          {user?.name}님, 환영합니다!
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">내 예약</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              총 예약 건수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              대기 중인 예약
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이용 가능 차량</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableVehicles}</div>
            <p className="text-xs text-muted-foreground">
              전체 {vehicles.length}대 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이용 가능 부속실</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableRooms}</div>
            <p className="text-xs text-muted-foreground">
              전체 {rooms.length}개 중
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 작업 */}
      <Card>
        <CardHeader>
          <CardTitle>빠른 작업</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/vehicle-booking">
              <Car className="h-6 w-6" />
              <span>차량 예약</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/room-booking">
              <Building className="h-6 w-6" />
              <span>부속실 예약</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/bookings">
              <Calendar className="h-6 w-6" />
              <span>예약 조회</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
            <Link href="/dashboard/vehicles">
              <Car className="h-6 w-6" />
              <span>차량 관리</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 다가오는 예약 */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>다가오는 예약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {booking.type === 'vehicle'
                        ? `차량: ${booking.vehicleName}`
                        : `부속실: ${booking.roomName}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.startDate).toLocaleDateString('ko-KR')} ~{' '}
                      {new Date(booking.endDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/bookings">상세보기</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
