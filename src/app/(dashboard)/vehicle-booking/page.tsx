'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import { vehicleBookingSchema, type VehicleBookingFormValues } from '@/lib/validations/booking';
import { useAuthStore } from '@/store/authStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useBookingStore } from '@/store/bookingStore';
import { vehicleApi } from '@/lib/api/vehicles';
import { bookingApi } from '@/lib/api/bookings';
import { cn } from '@/lib/utils';

/**
 * 차량 예약 페이지
 */
export default function VehicleBookingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { vehicles, setVehicles } = useVehicleStore();
  const { addBooking } = useBookingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VehicleBookingFormValues>({
    resolver: zodResolver(vehicleBookingSchema),
    defaultValues: {
      vehicleId: '',
      vehicleName: '',
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

  const onSubmit = async (data: VehicleBookingFormValues) => {
    if (!user) {
      toast.error('로그인이 필요합니다');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await bookingApi.createVehicleBooking(
        data,
        user.id,
        user.name
      );

      if (result.success && result.data) {
        addBooking(result.data);
        toast.success('차량 예약이 완료되었습니다');
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

  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  const selectedVehicleId = form.watch('vehicleId');
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

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
          차량을 예약합니다
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
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>차량 선택</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const vehicle = vehicles.find((v) => v.id === value);
                        if (vehicle) {
                          form.setValue('vehicleName', vehicle.name);
                        }
                      }}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="차량을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableVehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} ({vehicle.licensePlate}) - {vehicle.capacity}인승
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedVehicle && (
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold">선택한 차량 정보</h3>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>차량명: {selectedVehicle.name}</p>
                    <p>차량번호: {selectedVehicle.licensePlate}</p>
                    <p>탑승 인원: {selectedVehicle.capacity}명</p>
                    {selectedVehicle.description && (
                      <p>설명: {selectedVehicle.description}</p>
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
                      <FormLabel>시작 날짜</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>날짜 선택</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>종료 날짜</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={isSubmitting}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'PPP')
                              ) : (
                                <span>날짜 선택</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
