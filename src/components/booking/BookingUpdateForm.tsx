'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Booking, VehicleBooking, RoomBooking } from '@/types';
import {
  vehicleBookingUpdateSchema,
  roomBookingUpdateSchema,
  type VehicleBookingUpdateValues,
  type RoomBookingUpdateValues,
} from '@/lib/validations/booking';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface BookingUpdateFormProps {
  booking: Booking;
  onSubmit: (data: Partial<Booking>) => Promise<void>;
  onCancel: () => void;
}

/**
 * 예약 수정 폼 컴포넌트
 */
export function BookingUpdateForm({
  booking,
  onSubmit,
  onCancel,
}: BookingUpdateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isVehicle = booking.type === 'vehicle';

  // 차량/부속실 타입에 따라 적절한 스키마 선택
  const form = useForm<
    VehicleBookingUpdateValues | RoomBookingUpdateValues
  >({
    resolver: zodResolver(
      isVehicle ? vehicleBookingUpdateSchema : roomBookingUpdateSchema
    ),
    defaultValues: isVehicle
      ? {
          startDate: booking.startDate,
          endDate: booking.endDate,
          destination: (booking as VehicleBooking).destination,
          purpose: booking.purpose,
        }
      : {
          startDate: booking.startDate,
          endDate: booking.endDate,
          attendees: (booking as RoomBooking).attendees,
          purpose: booking.purpose,
        },
  });

  const handleSubmit = async (
    data: VehicleBookingUpdateValues | RoomBookingUpdateValues
  ) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* 시작/종료 시간 */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>시작 시간</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="시작 시간을 선택하세요"
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
              <FormItem>
                <FormLabel>종료 시간</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="종료 시간을 선택하세요"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 차량: 목적지 / 부속실: 참석 인원 */}
        {isVehicle ? (
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>목적지</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="목적지를 입력하세요"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="attendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>참석 인원</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === '' ? 0 : parseInt(value, 10));
                    }}
                    placeholder="참석 인원을 입력하세요"
                    disabled={isSubmitting}
                    min={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 사용 목적 */}
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>사용 목적</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={3}
                  placeholder="사용 목적을 입력하세요"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 버튼 */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                저장 중...
              </>
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
