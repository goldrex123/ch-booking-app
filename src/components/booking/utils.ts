import { format } from 'date-fns';
import type { Booking } from '@/types';

/**
 * 달력 이벤트 타입 정의
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    type: 'vehicle' | 'room';
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    bookerName: string;
    resourceName: string;
  };
}

/**
 * 예약을 달력 이벤트로 변환
 */
export function bookingToCalendarEvent(booking: Booking): CalendarEvent {
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);

  // 시간 범위 표시 (예: "09:00 - 17:00")
  const timeRange = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;

  // 예약 유형별 자원 이름
  const resourceName =
    booking.type === 'vehicle' ? booking.vehicleName : booking.roomName;

  return {
    id: booking.id,
    title: `${resourceName} (${timeRange})`,
    start,
    end,
    resource: {
      type: booking.type,
      status: booking.status,
      bookerName: booking.userName,
      resourceName,
    },
  };
}

/**
 * 여러 예약을 이벤트 배열로 변환
 * - 취소된 예약은 제외
 * - 시작 날짜 기준으로 정렬
 */
export function bookingsToCalendarEvents(
  bookings: Booking[]
): CalendarEvent[] {
  return bookings
    .filter((b) => b.status !== 'cancelled')
    .map(bookingToCalendarEvent)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * 예약 상태별 색상 반환
 */
export function getEventColor(
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | undefined
): { bg: string; border: string; text: string } {
  switch (status) {
    case 'approved':
      return {
        bg: 'rgb(34, 197, 94)', // green-500
        border: 'rgb(22, 163, 74)', // green-600
        text: 'white',
      };
    case 'pending':
      return {
        bg: 'rgb(59, 130, 246)', // blue-500
        border: 'rgb(37, 99, 235)', // blue-600
        text: 'white',
      };
    case 'rejected':
      return {
        bg: 'rgb(239, 68, 68)', // red-500
        border: 'rgb(220, 38, 38)', // red-600
        text: 'white',
      };
    default:
      return {
        bg: 'rgb(107, 114, 128)', // gray-500
        border: 'rgb(75, 85, 99)', // gray-600
        text: 'white',
      };
  }
}
