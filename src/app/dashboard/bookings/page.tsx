'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import { useBookingStore } from '@/store/bookingStore';
import { useAuthStore } from '@/store/authStore';
import { bookingApi } from '@/lib/api/bookings';
import type { Booking } from '@/types';
import { BOOKING_STATUS_LABELS } from '@/lib/constants';

/**
 * 예약 조회 페이지
 */
export default function BookingsPage() {
  const { user } = useAuthStore();
  const { bookings, setBookings } = useBookingStore();
  const [isLoading, setIsLoading] = useState(true);

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

  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const myBookings = bookings.filter((b) => b.userId === user?.id);
  const vehicleBookings = myBookings.filter((b) => b.type === 'vehicle');
  const roomBookings = myBookings.filter((b) => b.type === 'room');

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

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">전체 ({myBookings.length})</TabsTrigger>
          <TabsTrigger value="vehicle">차량 ({vehicleBookings.length})</TabsTrigger>
          <TabsTrigger value="room">부속실 ({roomBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <BookingTable bookings={myBookings} getStatusVariant={getStatusVariant} />
        </TabsContent>

        <TabsContent value="vehicle" className="space-y-4">
          <BookingTable bookings={vehicleBookings} getStatusVariant={getStatusVariant} />
        </TabsContent>

        <TabsContent value="room" className="space-y-4">
          <BookingTable bookings={roomBookings} getStatusVariant={getStatusVariant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingTable({
  bookings,
  getStatusVariant,
}: {
  bookings: Booking[];
  getStatusVariant: (status: Booking['status']) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>예약 목록</CardTitle>
        <CardDescription>
          총 {bookings.length}건의 예약이 있습니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            예약 내역이 없습니다
          </div>
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>유형</TableHead>
                  <TableHead>대상</TableHead>
                  <TableHead>시작일</TableHead>
                  <TableHead>종료일</TableHead>
                  <TableHead>목적</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {booking.type === 'vehicle' ? '차량' : '부속실'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.type === 'vehicle'
                        ? booking.vehicleName
                        : booking.roomName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.startDate), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.endDate), 'PPP', { locale: ko })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {booking.purpose}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status) as "default" | "destructive" | "outline" | "secondary"}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
