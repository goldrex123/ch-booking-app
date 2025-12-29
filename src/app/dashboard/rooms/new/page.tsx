'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomForm } from '@/components/room/RoomForm';

import { roomApi } from '@/lib/api/rooms';
import { useRoomStore } from '@/store/roomStore';
import type { RoomFormValues } from '@/lib/validations/room';

/**
 * 부속실 생성 페이지
 */
export default function NewRoomPage() {
  const router = useRouter();
  const { addRoom } = useRoomStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: RoomFormValues) => {
    setIsLoading(true);

    try {
      const result = await roomApi.create(data);

      if (result.success && result.data) {
        addRoom(result.data);
        toast.success('부속실이 등록되었습니다');
        router.push('/dashboard/rooms');
      } else {
        toast.error(result.error || '부속실 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('부속실 등록 오류:', error);
      toast.error('부속실 등록 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/rooms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">부속실 등록</h1>
          <p className="text-muted-foreground">
            새로운 부속실을 등록합니다
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>부속실 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
