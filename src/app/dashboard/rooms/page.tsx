'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

import { useRoomStore } from '@/store/roomStore';
import { roomApi } from '@/lib/api/rooms';
import type { Room } from '@/types';
import { ROOM_STATUS_LABELS } from '@/lib/constants';

/**
 * 부속실 목록 페이지
 */
export default function RoomsPage() {
  const { rooms, setRooms, deleteRoom } = useRoomStore();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const result = await roomApi.delete(deleteTarget.id);
      if (result.success) {
        deleteRoom(deleteTarget.id);
        toast.success('부속실이 삭제되었습니다');
      } else {
        toast.error(result.error || '부속실 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('부속실 삭제 오류:', error);
      toast.error('부속실 삭제 중 오류가 발생했습니다');
    } finally {
      setDeleteTarget(null);
    }
  };

  const getStatusVariant = (status: Room['status']) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'in-use':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">부속실 관리</h1>
          <p className="text-muted-foreground">
            등록된 부속실을 관리합니다
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/rooms/new">
            <Plus className="mr-2 h-4 w-4" />
            부속실 등록
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>부속실 목록</CardTitle>
          <CardDescription>
            총 {rooms.length}개의 부속실이 등록되어 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              등록된 부속실이 없습니다
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>부속실명</TableHead>
                    <TableHead>위치</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>{room.location}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(room.status)}>
                          {ROOM_STATUS_LABELS[room.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                          >
                            <Link href={`/dashboard/rooms/${room.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(room)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="부속실 삭제"
        description={`정말로 "${deleteTarget?.name}" 부속실을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        onConfirm={handleDelete}
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  );
}
