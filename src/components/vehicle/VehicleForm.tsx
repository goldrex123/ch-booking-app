'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import { vehicleSchema, type VehicleFormValues } from '@/lib/validations/vehicle';
import type { Vehicle } from '@/types';

interface VehicleFormProps {
  mode: 'create' | 'edit';
  initialData?: Vehicle;
  onSubmit: (data: VehicleFormValues) => void;
  isLoading?: boolean;
}

/**
 * 차량 폼 컴포넌트
 */
export function VehicleForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
}: VehicleFormProps) {
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          licensePlate: initialData.licensePlate,
          type: initialData.type,
          capacity: initialData.capacity,
          status: initialData.status,
          description: initialData.description || '',
        }
      : {
          name: '',
          licensePlate: '',
          type: 'sedan',
          capacity: 5,
          status: 'available',
          description: '',
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>차량명</FormLabel>
                <FormControl>
                  <Input placeholder="예: 소나타" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>차량번호</FormLabel>
                <FormControl>
                  <Input placeholder="예: 12가 3456" disabled={isLoading} {...field} />
                </FormControl>
                <FormDescription>
                  형식: 12가 3456 또는 123가 4567
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>차량 유형</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="차량 유형 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sedan">세단</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="van">승합차</SelectItem>
                    <SelectItem value="truck">트럭</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>탑승 인원</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상태</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="available">사용 가능</SelectItem>
                    <SelectItem value="in-use">사용 중</SelectItem>
                    <SelectItem value="maintenance">정비 중</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택사항)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="차량에 대한 추가 정보를 입력하세요"
                  className="min-h-[100px]"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : mode === 'create' ? (
              '등록'
            ) : (
              '수정'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
