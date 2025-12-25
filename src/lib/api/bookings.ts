import type {
  Booking,
  VehicleBooking,
  RoomBooking,
  VehicleBookingFormData,
  RoomBookingFormData,
} from '@/types';
import { storage, simulateApiCall, type ApiResponse } from './client';
import { nanoid } from 'nanoid';
import { isAfter, isBefore, parseISO, isEqual } from 'date-fns';

const STORAGE_KEY = 'bookings';

/**
 * 날짜 범위 겹침 체크
 */
function hasDateOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseISO(start1);
  const e1 = parseISO(end1);
  const s2 = parseISO(start2);
  const e2 = parseISO(end2);

  // 겹치는 경우:
  // 1. s1이 s2와 e2 사이에 있거나
  // 2. e1이 s2와 e2 사이에 있거나
  // 3. s1이 s2보다 이전이고 e1이 e2보다 이후인 경우
  return (
    (isAfter(s1, s2) && isBefore(s1, e2)) ||
    (isAfter(e1, s2) && isBefore(e1, e2)) ||
    (isBefore(s1, s2) && isAfter(e1, e2)) ||
    isEqual(s1, s2) ||
    isEqual(e1, e2)
  );
}

/**
 * 예약 API
 */
export const bookingApi = {
  /**
   * 예약 목록 조회
   */
  async getAll(): Promise<ApiResponse<Booking[]>> {
    return simulateApiCall(() => {
      return storage.get<Booking[]>(STORAGE_KEY) || [];
    });
  },

  /**
   * 예약 상세 조회
   */
  async getById(id: string): Promise<ApiResponse<Booking>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];
      const booking = bookings.find((b) => b.id === id);

      if (!booking) {
        throw new Error('예약을 찾을 수 없습니다');
      }

      return booking;
    });
  },

  /**
   * 날짜 범위로 예약 조회
   */
  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<Booking[]>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];
      const rangeStart = parseISO(startDate);
      const rangeEnd = parseISO(endDate);

      return bookings.filter((booking) => {
        const bookingStart = parseISO(booking.startDate);
        const bookingEnd = parseISO(booking.endDate);

        return (
          (isAfter(bookingStart, rangeStart) ||
            isEqual(bookingStart, rangeStart)) &&
          (isBefore(bookingEnd, rangeEnd) || isEqual(bookingEnd, rangeEnd))
        );
      });
    });
  },

  /**
   * 사용자별 예약 조회
   */
  async getByUserId(userId: string): Promise<ApiResponse<Booking[]>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];
      return bookings.filter((b) => b.userId === userId);
    });
  },

  /**
   * 차량 예약 생성
   */
  async createVehicleBooking(
    data: VehicleBookingFormData,
    userId: string,
    userName: string
  ): Promise<ApiResponse<VehicleBooking>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];

      // 중복 예약 체크
      const hasConflict = bookings.some((booking) => {
        if (booking.type !== 'vehicle' || booking.vehicleId !== data.vehicleId) {
          return false;
        }

        // 취소된 예약은 제외
        if (booking.status === 'cancelled') {
          return false;
        }

        return hasDateOverlap(
          booking.startDate,
          booking.endDate,
          data.startDate,
          data.endDate
        );
      });

      if (hasConflict) {
        throw new Error('해당 시간대에 이미 차량 예약이 존재합니다');
      }

      const newBooking: VehicleBooking = {
        ...data,
        type: 'vehicle',
        id: nanoid(),
        userId,
        userName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      bookings.push(newBooking);
      storage.set(STORAGE_KEY, bookings);

      return newBooking;
    });
  },

  /**
   * 부속실 예약 생성
   */
  async createRoomBooking(
    data: RoomBookingFormData,
    userId: string,
    userName: string
  ): Promise<ApiResponse<RoomBooking>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];

      // 중복 예약 체크
      const hasConflict = bookings.some((booking) => {
        if (booking.type !== 'room' || booking.roomId !== data.roomId) {
          return false;
        }

        // 취소된 예약은 제외
        if (booking.status === 'cancelled') {
          return false;
        }

        return hasDateOverlap(
          booking.startDate,
          booking.endDate,
          data.startDate,
          data.endDate
        );
      });

      if (hasConflict) {
        throw new Error('해당 시간대에 이미 부속실 예약이 존재합니다');
      }

      const newBooking: RoomBooking = {
        ...data,
        type: 'room',
        id: nanoid(),
        userId,
        userName,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      bookings.push(newBooking);
      storage.set(STORAGE_KEY, bookings);

      return newBooking;
    });
  },

  /**
   * 예약 상태 변경
   */
  async updateStatus(
    id: string,
    status: Booking['status']
  ): Promise<ApiResponse<Booking>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];
      const index = bookings.findIndex((b) => b.id === id);

      if (index === -1) {
        throw new Error('예약을 찾을 수 없습니다');
      }

      const updatedBooking = {
        ...bookings[index],
        status,
        updatedAt: new Date().toISOString(),
      } as Booking;

      bookings[index] = updatedBooking;
      storage.set(STORAGE_KEY, bookings);
      return updatedBooking;
    });
  },

  /**
   * 예약 취소
   */
  async cancel(id: string): Promise<ApiResponse<Booking>> {
    return this.updateStatus(id, 'cancelled');
  },

  /**
   * 예약 승인
   */
  async approve(id: string): Promise<ApiResponse<Booking>> {
    return this.updateStatus(id, 'approved');
  },

  /**
   * 예약 거부
   */
  async reject(id: string): Promise<ApiResponse<Booking>> {
    return this.updateStatus(id, 'rejected');
  },

  /**
   * 예약 삭제 (관리자만)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];
      const filtered = bookings.filter((b) => b.id !== id);

      if (filtered.length === bookings.length) {
        throw new Error('예약을 찾을 수 없습니다');
      }

      storage.set(STORAGE_KEY, filtered);
      return undefined;
    });
  },
};
