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
  multiVehicleBookingSchema,
  type MultiVehicleBookingFormValues,
} from '@/lib/validations/booking';
import { useAuthStore } from '@/store/authStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useBookingStore } from '@/store/bookingStore';
import { vehicleApi } from '@/lib/api/vehicles';
import { bookingApi } from '@/lib/api/bookings';
import { isBeforeToday } from '@/lib/utils';

/**
 * 차량 예약 페이지 (다중 선택 지원)
 */
export default function VehicleBookingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { vehicles, setVehicles } = useVehicleStore();
  const { addBooking } = useBookingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<MultiVehicleBookingFormValues>({
    resolver: zodResolver(multiVehicleBookingSchema),
    defaultValues: {
      vehicleIds: [],
      startDate: '',
      endDate: '',
      destination: '',
      purpose: '',
    },
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const result = await vehicleApi.getAll();
      if (result.success && result.data) {
        setVehicles(result.data);
      }
    } catch (error) {
      console.error('차량 목록 로드 오류:', error);
      toast.error('차량 목록을 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: MultiVehicleBookingFormValues) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsSubmitting(true);

    try {
      // 차량 이름 맵 생성
      const vehicleMap = new Map(
        vehicles.map((v) => [v.id, { name: v.name }])
      );

      const result = await bookingApi.createMultiVehicleBookings(
        data,
        user.id,
        user.name,
        vehicleMap
      );

      if (result.success && result.data) {
        const { succeeded, failed } = result.data;

        // 성공한 예약들을 스토어에 추가
        if (succeeded.length > 0) {
          succeeded.forEach((booking) => addBooking(booking));
        }

        // 결과 메시지 표시
        if (succeeded.length > 0 && failed.length === 0) {
          toast.success(`${succeeded.length}건의 차량 예약이 완료되었습니다`);
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

  const availableVehicles = vehicles.filter((v) => v.status === 'available');
  const selectedVehicleIds = form.watch('vehicleIds');
  const selectedVehicles = vehicles.filter((v) =>
    selectedVehicleIds.includes(v.id)
  );

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
        <h1 className="text-3xl font-bold">차량 예약</h1>
        <p className="text-muted-foreground">
          한 번에 여러 차량을 예약할 수 있습니다 (최대 10개)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>예약 정보</CardTitle>
          <CardDescription>
            사용 가능한 차량: {availableVehicles.length}대
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="vehicleIds"
                render={() => (
                  <FormItem>
                    <FormLabel>차량 선택 (다중 선택 가능)</FormLabel>
                    <div className="space-y-2">
                      {availableVehicles.map((vehicle) => (
                        <FormField
                          key={vehicle.id}
                          control={form.control}
                          name="vehicleIds"
                          render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(vehicle.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          vehicle.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (id) => id !== vehicle.id
                                          )
                                        );
                                  }}
                                  disabled={isSubmitting}
                                />
                              </FormControl>
                              <div className="flex-1 space-y-1 leading-none">
                                <FormLabel className="cursor-pointer font-medium">
                                  {vehicle.name} ({vehicle.licensePlate}) -{' '}
                                  {vehicle.capacity}인승
                                </FormLabel>
                                {vehicle.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {vehicle.description}
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

              {selectedVehicles.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">
                    선택한 차량: {selectedVehicles.length}대
                  </h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {selectedVehicles.map((vehicle) => (
                      <li key={vehicle.id}>
                        • {vehicle.name} ({vehicle.licensePlate})
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
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>목적지</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="예: 서울시 강남구"
                        disabled={isSubmitting}
                        {...field}
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
                        placeholder="차량 사용 목적을 입력하세요"
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
                    `예약하기 (${selectedVehicleIds.length}대)`
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
