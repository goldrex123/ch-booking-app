import type { Booking } from '@/types';

/**
 * 예약 수정 가능 여부 확인
 * - 본인의 예약이고 승인 대기(pending) 상태일 때만 수정 가능
 */
export function canEditBooking(booking: Booking, userId: string): boolean {
  return booking.userId === userId && booking.status === 'pending';
}

/**
 * 예약 취소 가능 여부 확인
 * - 본인의 예약이고 승인됨(approved) 상태일 때만 취소 가능
 */
export function canCancelBooking(booking: Booking, userId: string): boolean {
  return booking.userId === userId && booking.status === 'approved';
}

/**
 * 예약 삭제 가능 여부 확인
 * - 본인의 예약이고 승인 대기(pending) 상태일 때만 삭제 가능
 */
export function canDeleteBooking(booking: Booking, userId: string): boolean {
  return booking.userId === userId && booking.status === 'pending';
}
