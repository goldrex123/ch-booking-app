'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import { roomBookingSchema, type RoomBookingFormValues } from '@/lib/validations/booking';
import { useAuthStore } from '@/store/authStore';
import { useRoomStore } from '@/store/roomStore';
import { useBookingStore } from '@/store/bookingStore';
import { roomApi } from '@/lib/api/rooms';
import { bookingApi } from '@/lib/api/bookings';
import { cn } from '@/lib/utils';

/**
 * 부속실 예약 페이지
 */
export default function RoomBookingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { rooms, setRooms } = useRoomStore();
  const { addBooking } = useBookingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RoomBookingFormValues>({
    resolver: zodResolver(roomBookingSchema),
    defaultValues: {
      roomId: '',
      roomName: '',
      startDate: '',
      endDate: '',
      attendees: 1,
      purpose: '',
    },
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const result = await roomApi.getAll();
      if (result.success && result.data) {
        setRooms(result.data);
      }
    } catch (error) {
      console.error('부속실 목록 로드 오류:', error);
      toast.error('부속실 목록을 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RoomBookingFormValues) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await bookingApi.createRoomBooking(
        data,
        user.id,
        user.name
      );

      if (result.success && result.data) {
        addBooking(result.data);
        toast.success('부속실 예약이 완료되었습니다');
        router.push('/dashboard/bookings');
      } else {
        toast.error(result.error || '예약에 실패했습니다');
      }
    } catch (error) {
      console.error('예약 오류:', error);
      toast.error('예약 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRooms = rooms.filter((r) => r.status === 'available');

  const selectedRoomId = form.watch('roomId');
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

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
        <h1 className="text-3xl font-bold">부속실 예약</h1>
        <p className="text-muted-foreground">
          부속실을 예약합니다
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>예약 정보</CardTitle>
          <CardDescription>
            사용 가능한 부속실: {availableRooms.length}개
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>부속실 선택</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const room = rooms.find((r) => r.id === value);
                        if (room) {
                          form.setValue('roomName', room.name);
                        }
                      }}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="부속실을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} ({room.location}) - 수용 {room.capacity}명
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRoom && (
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">선택한 부속실 정보</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>부속실명: {selectedRoom.name}</p>
                    <p>위치: {selectedRoom.location}</p>
                    <p>수용 인원: {selectedRoom.capacity}명</p>
                    <p>시설: {selectedRoom.facilities.join(', ')}</p>
                    {selectedRoom.description && (
                      <p>설명: {selectedRoom.description}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>시작 날짜 및 시간</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                          disabledDates={(date) => date < new Date()}
                          placeholder="날짜와 시간 선택"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>종료 날짜 및 시간</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isSubmitting}
                          disabledDates={(date) => date < new Date()}
                          placeholder="날짜와 시간 선택"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>참석 인원</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={500}
                        placeholder="예: 10"
                        disabled={isSubmitting}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedRoom && `선택한 부속실 수용인원: ${selectedRoom.capacity}명`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>사용 목적</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="부속실 사용 목적을 입력하세요"
                        className="min-h-[100px]"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/bookings')}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingSpinner size="sm" /> : '예약하기'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
