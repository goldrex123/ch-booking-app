'use client';

import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingDetailDialog } from '@/components/booking/BookingDetailDialog';
import { bookingsToCalendarEvents } from '@/components/booking/utils';

import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { bookingApi } from '@/lib/api/bookings';
import type { Booking } from '@/types';

/**
 * 예약 조회 페이지
 */
export default function BookingsPage() {
  const { user } = useAuthStore();
  const { bookings, setBookings, updateBooking, deleteBooking } =
    useBookingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const result = await bookingApi.getAll();
      if (result.success && result.data) {
        setBookings(result.data);
      }
    } catch (error) {
      console.error('예약 목록 로드 오류:', error);
      toast.error('예약 목록을 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 예약 수정 핸들러
  const handleUpdate = async (data: Partial<Booking>) => {
    if (!selectedBooking) return;

    try {
      const result = await bookingApi.update(selectedBooking.id, data);
      if (result.success && result.data) {
        updateBooking(selectedBooking.id, result.data);
        toast.success('예약이 수정되었습니다');
        setDialogOpen(false);
        setSelectedBooking(null);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '예약 수정에 실패했습니다';
      toast.error(message);
      throw error;
    }
  };

  // 예약 삭제 핸들러
  const handleDelete = async () => {
    if (!selectedBooking) return;

    try {
      const result = await bookingApi.delete(selectedBooking.id);
      if (result.success) {
        deleteBooking(selectedBooking.id);
        toast.success('예약이 삭제되었습니다');
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '예약 삭제에 실패했습니다';
      toast.error(message);
      throw error;
    }
  };

  const myBookings = bookings.filter((b) => b.userId === user?.id);
  const vehicleBookings = myBookings.filter((b) => b.type === 'vehicle');
  const roomBookings = myBookings.filter((b) => b.type === 'room');

  // 예약을 달력 이벤트로 변환 (메모이제이션)
  const allEvents = useMemo(
    () => bookingsToCalendarEvents(myBookings),
    [myBookings]
  );
  const vehicleEvents = useMemo(
    () => bookingsToCalendarEvents(vehicleBookings),
    [vehicleBookings]
  );
  const roomEvents = useMemo(
    () => bookingsToCalendarEvents(roomBookings),
    [roomBookings]
  );

  // 예약 선택 핸들러 (달력 이벤트 클릭)
  const handleSelectEvent = (event: { id: string }) => {
    const booking = bookings.find((b) => b.id === event.id);
    if (booking) {
      setSelectedBooking(booking);
      setDialogOpen(true);
    }
  };

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
        <h1 className="text-3xl font-bold">예약 조회</h1>
        <p className="text-muted-foreground">
          내 예약 목록을 확인합니다
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">전체 ({myBookings.length})</TabsTrigger>
          <TabsTrigger value="vehicle">차량 ({vehicleBookings.length})</TabsTrigger>
          <TabsTrigger value="room">부속실 ({roomBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>전체 예약 달력</CardTitle>
              <CardDescription>
                총 {myBookings.length}건의 예약이 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myBookings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  예약 내역이 없습니다
                </div>
              ) : (
                <BookingCalendar
                  events={allEvents}
                  onSelectEvent={handleSelectEvent}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>차량 예약 달력</CardTitle>
              <CardDescription>
                총 {vehicleBookings.length}건의 차량 예약이 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicleBookings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  차량 예약 내역이 없습니다
                </div>
              ) : (
                <BookingCalendar
                  events={vehicleEvents}
                  onSelectEvent={handleSelectEvent}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="room" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>부속실 예약 달력</CardTitle>
              <CardDescription>
                총 {roomBookings.length}건의 부속실 예약이 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              {roomBookings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  부속실 예약 내역이 없습니다
                </div>
              ) : (
                <BookingCalendar
                  events={roomEvents}
                  onSelectEvent={handleSelectEvent}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 예약 상세 정보 다이얼로그 */}
      {user && (
        <BookingDetailDialog
          booking={selectedBooking}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          userId={user.id}
        />
      )}
    </div>
  );
}

