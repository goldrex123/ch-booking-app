'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import { roomSchema, type RoomFormValues } from '@/lib/validations/room';
import { COMMON_FACILITIES } from '@/lib/constants';
import type { Room } from '@/types';

interface RoomFormProps {
  mode: 'create' | 'edit';
  initialData?: Room;
  onSubmit: (data: RoomFormValues) => void;
  isLoading?: boolean;
}

/**
 * 부속실 폼 컴포넌트
 */
export function RoomForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
}: RoomFormProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          location: initialData.location,
          capacity: initialData.capacity,
          facilities: initialData.facilities,
          status: initialData.status,
          description: initialData.description || '',
          imageUrl: initialData.imageUrl || '',
        }
      : {
          name: '',
          location: '',
          capacity: 10,
          facilities: [],
          status: 'available',
          description: '',
          imageUrl: '',
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
                <FormLabel>부속실명</FormLabel>
                <FormControl>
                  <Input placeholder="예: 대회의실" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>위치</FormLabel>
                <FormControl>
                  <Input placeholder="예: 본관 3층" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>수용 인원</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={500}
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

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이미지 URL (선택사항)</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="facilities"
          render={() => (
            <FormItem>
              <FormLabel>시설</FormLabel>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {COMMON_FACILITIES.map((facility) => (
                  <FormField
                    key={facility}
                    control={form.control}
                    name="facilities"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(facility)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, facility])
                                : field.onChange(
                                    field.value?.filter((value) => value !== facility)
                                  );
                            }}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{facility}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택사항)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="부속실에 대한 추가 정보를 입력하세요"
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
