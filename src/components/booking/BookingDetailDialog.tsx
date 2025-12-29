'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import type { Booking } from '@/types';
import {
  canEditBooking,
  canCancelBooking,
  canDeleteBooking,
} from '@/lib/utils/booking';
import { BOOKING_STATUS_LABELS } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { BookingUpdateForm } from './BookingUpdateForm';

interface BookingDetailDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: Partial<Booking>) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => Promise<void>;
  userId: string;
}

/**
 * 예약 상세 정보 다이얼로그
 * - 읽기 모드: 예약 상세 정보 표시
 * - 수정 모드: 예약 정보 수정 폼
 */
export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onCancel,
  userId,
}: BookingDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!booking) return null;

  // 권한 체크
  const canEdit = canEditBooking(booking, userId);
  const canCancelBooking_ = canCancelBooking(booking, userId);
  const canDelete_ = canDeleteBooking(booking, userId);

  // 수정 핸들러
  const handleUpdate = async (data: Partial<Booking>) => {
    await onUpdate(data);
    setIsEditing(false);
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    await onDelete();
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  // 취소 핸들러
  const handleCancel = async () => {
    await onCancel();
    setShowCancelConfirm(false);
    onOpenChange(false);
  };

  // 상태별 Badge variant
  const getStatusVariant = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {booking.type === 'vehicle' ? '차량 예약' : '부속실 예약'} 상세
            </DialogTitle>
          </DialogHeader>

          {/* 수정 모드 */}
          {isEditing ? (
            <BookingUpdateForm
              booking={booking}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            /* 읽기 모드 */
            <div className="space-y-4">
              {/* 기본 정보 */}
              <div className="grid gap-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">
                    유형
                  </span>
                  <span>
                    {booking.type === 'vehicle' ? '차량 예약' : '부속실 예약'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">
                    {booking.type === 'vehicle' ? '차량' : '부속실'}
                  </span>
                  <span className="font-medium">
                    {booking.type === 'vehicle'
                      ? booking.vehicleName
                      : booking.roomName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">
                    예약자
                  </span>
                  <span>{booking.userName}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">
                    시작 시간
                  </span>
                  <span>
                    {format(new Date(booking.startDate), 'PPP p', { locale: ko })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-muted-foreground">
                    종료 시간
                  </span>
                  <span>
                    {format(new Date(booking.endDate), 'PPP p', { locale: ko })}
                  </span>
                </div>

                {/* 차량: 목적지 / 부속실: 참석 인원 */}
                {booking.type === 'vehicle' ? (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium text-muted-foreground">
                      목적지
                    </span>
                    <span>{booking.destination}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium text-muted-foreground">
                      참석 인원
                    </span>
                    <span>{booking.attendees}명</span>
                  </div>
                )}

                <div className="flex justify-between items-start py-2 border-b">
                  <span className="font-medium text-muted-foreground">
                    사용 목적
                  </span>
                  <span className="text-right max-w-md">{booking.purpose}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-muted-foreground">
                    상태
                  </span>
                  <Badge
                    variant={
                      getStatusVariant(
                        booking.status
                      ) as 'default' | 'destructive' | 'outline' | 'secondary'
                    }
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </Badge>
                </div>
              </div>

              {/* 버튼 */}
              <DialogFooter>
                {canEdit && (
                  <Button onClick={() => setIsEditing(true)}>수정</Button>
                )}
                {canCancelBooking_ && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelConfirm(true)}
                  >
                    취소
                  </Button>
                )}
                {canDelete_ && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    삭제
                  </Button>
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  닫기
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="예약 삭제"
        description="이 예약을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDelete}
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 취소 확인 다이얼로그 */}
      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        title="예약 취소"
        description="승인된 예약을 취소하시겠습니까?"
        onConfirm={handleCancel}
        confirmText="취소하기"
        cancelText="돌아가기"
      />
    </>
  );
}
