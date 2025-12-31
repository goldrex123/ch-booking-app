'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import {
  multiRoomBookingSchema,
  type MultiRoomBookingFormValues,
} from '@/lib/validations/booking';
import { useAuthStore } from '@/store/authStore';
import { useRoomStore } from '@/store/roomStore';
import { useBookingStore } from '@/store/bookingStore';
import { roomApi } from '@/lib/api/rooms';
import { bookingApi } from '@/lib/api/bookings';
import { isBeforeToday } from '@/lib/utils';

/**
 * 부속실 예약 페이지 (다중 선택 지원)
 */
export default function RoomBookingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { rooms, setRooms } = useRoomStore();
  const { addBooking } = useBookingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MultiRoomBookingFormValues>({
    resolver: zodResolver(multiRoomBookingSchema),
    defaultValues: {
      roomIds: [],
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

  const onSubmit = async (data: MultiRoomBookingFormValues) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsSubmitting(true);

    try {
      // 부속실 이름 맵 생성
      const roomMap = new Map(rooms.map((r) => [r.id, { name: r.name }]));

      const result = await bookingApi.createMultiRoomBookings(
        data,
        user.id,
        user.name,
        roomMap
      );

      if (result.success && result.data) {
        const { succeeded, failed } = result.data;

        // 성공한 예약들을 스토어에 추가
        if (succeeded.length > 0) {
          succeeded.forEach((booking) => addBooking(booking));
        }

        // 결과 메시지 표시
        if (succeeded.length > 0 && failed.length === 0) {
          toast.success(`${succeeded.length}건의 부속실 예약이 완료되었습니다`);
          router.push('/dashboard/bookings');
        } else if (succeeded.length > 0 && failed.length > 0) {
          toast.warning(
            `${succeeded.length}건 성공, ${failed.length}건 실패했습니다`
          );
          console.error('실패한 예약:', failed);
        } else {
          toast.error('모든 예약이 실패했습니다');
          console.error('실패한 예약:', failed);
        }
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
  const selectedRoomIds = form.watch('roomIds');
  const selectedRooms = rooms.filter((r) => selectedRoomIds.includes(r.id));

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
          한 번에 여러 부속실을 예약할 수 있습니다 (최대 10개)
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
                name="roomIds"
                render={() => (
                  <FormItem>
                    <FormLabel>부속실 선택 (다중 선택 가능)</FormLabel>
                    <div className="space-y-2">
                      {availableRooms.map((room) => (
                        <FormField
                          key={room.id}
                          control={form.control}
                          name="roomIds"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(room.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          room.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (id) => id !== room.id
                                          )
                                        );
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <div className="flex-1 space-y-1 leading-none">
                                <FormLabel className="cursor-pointer font-medium">
                                  {room.name} ({room.location})
                                </FormLabel>
                                {room.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {room.description}
                                  </p>
                                )}
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedRooms.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">
                    선택한 부속실: {selectedRooms.length}개
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {selectedRooms.map((room) => (
                      <li key={room.id}>
                        • {room.name} ({room.location})
                      </li>
                    ))}
                  </ul>
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
                          disabledDates={(date) => isBeforeToday(date)}
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
                          disabledDates={(date) => isBeforeToday(date)}
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
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
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
                  onClick={() => router.push('/dashboard')}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    `예약하기 (${selectedRoomIds.length}개)`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
