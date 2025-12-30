import type { Booking } from '@/types';

/**
 * 본인의 예약인지 확인
 * - 예약의 userId와 현재 userId가 일치하는지 확인
 */
export function isOwnBooking(booking: Booking, userId: string): boolean {
  return booking.userId === userId;
}
