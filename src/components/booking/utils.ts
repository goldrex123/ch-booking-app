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
      bookerName: booking.userName,
      resourceName,
    },
  };
}

/**
 * 여러 예약을 이벤트 배열로 변환
 * - 시작 날짜 기준으로 정렬
 */
export function bookingsToCalendarEvents(
  bookings: Booking[]
): CalendarEvent[] {
  return bookings
    .map(bookingToCalendarEvent)
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/**
 * 단일 이벤트 색상 (모든 예약 동일)
 */
export const BOOKING_EVENT_COLOR = {
  bg: 'rgb(59, 130, 246)', // blue-500
  border: 'rgb(37, 99, 235)', // blue-600
  text: 'white',
};
