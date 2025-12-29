'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomForm } from '@/components/room/RoomForm';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

import { roomApi } from '@/lib/api/rooms';
import { useRoomStore } from '@/store/roomStore';
import type { Room } from '@/types';
import type { RoomFormValues } from '@/lib/validations/room';

/**
 * 부속실 수정 페이지
 */
export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { updateRoom, deleteRoom } = useRoomStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadRoom();
  }, [id]);

  const loadRoom = async () => {
    setIsLoading(true);
    try {
      const result = await roomApi.getById(id);
      if (result.success && result.data) {
        setRoom(result.data);
      } else {
        toast.error('부속실을 찾을 수 없습니다');
        router.push('/dashboard/rooms');
      }
    } catch (error) {
      console.error('부속실 로드 오류:', error);
      toast.error('부속실 정보를 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: RoomFormValues) => {
    setIsSaving(true);

    try {
      const result = await roomApi.update(id, data);

      if (result.success && result.data) {
        updateRoom(id, result.data);
        toast.success('부속실 정보가 수정되었습니다');
        router.push('/dashboard/rooms');
      } else {
        toast.error(result.error || '부속실 수정에 실패했습니다');
      }
    } catch (error) {
      console.error('부속실 수정 오류:', error);
      toast.error('부속실 수정 중 오류가 발생했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await roomApi.delete(id);
      if (result.success) {
        deleteRoom(id);
        toast.success('부속실이 삭제되었습니다');
        router.push('/dashboard/rooms');
      } else {
        toast.error(result.error || '부속실 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('부속실 삭제 오류:', error);
      toast.error('부속실 삭제 중 오류가 발생했습니다');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/rooms">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">부속실 수정</h1>
            <p className="text-muted-foreground">
              부속실 정보를 수정합니다
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          삭제
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>부속실 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <RoomForm
            mode="edit"
            initialData={room}
            onSubmit={handleSubmit}
            isLoading={isSaving}
          />
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="부속실 삭제"
        description={`정말로 "${room.name}" 부속실을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        onConfirm={handleDelete}
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  );
}
