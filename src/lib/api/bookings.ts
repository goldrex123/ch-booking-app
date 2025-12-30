import type {
  Booking,
  VehicleBooking,
  RoomBooking,
  VehicleBookingFormData,
  RoomBookingFormData,
  MultiVehicleBookingFormData,
  MultiRoomBookingFormData,
} from '@/types';
import { storage, simulateApiCall, type ApiResponse } from './client';
import { STORAGE_KEYS } from '../constants';
import { nanoid } from 'nanoid';
import { isAfter, isBefore, parseISO, isEqual } from 'date-fns';

const STORAGE_KEY = STORAGE_KEYS.BOOKINGS;

/**
 * 다중 예약 생성 결과 타입
 */
interface MultiBookingResult<T> {
  succeeded: T[];
  failed: Array<{
    id: string;
    name: string;
    error: string;
  }>;
}

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

      // 서버 사이드 시간 검증
      const now = new Date();
      const startDate = parseISO(data.startDate);

      if (!isAfter(startDate, now)) {
        throw new Error('예약 시작 시간은 현재 시간 이후여야 합니다');
      }

      // 중복 예약 체크
      const hasConflict = bookings.some((booking) => {
        if (booking.type !== 'vehicle' || booking.vehicleId !== data.vehicleId) {
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

      // 서버 사이드 시간 검증
      const now = new Date();
      const startDate = parseISO(data.startDate);

      if (!isAfter(startDate, now)) {
        throw new Error('예약 시작 시간은 현재 시간 이후여야 합니다');
      }

      // 중복 예약 체크
      const hasConflict = bookings.some((booking) => {
        if (booking.type !== 'room' || booking.roomId !== data.roomId) {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      bookings.push(newBooking);
      storage.set(STORAGE_KEY, bookings);

      return newBooking;
    });
  },


  /**
   * 예약 수정
   */
  async update(
    id: string,
    data: Partial<Booking>
  ): Promise<ApiResponse<Booking>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];
      const targetIndex = bookings.findIndex((b) => b.id === id);

      if (targetIndex === -1) {
        throw new Error('예약을 찾을 수 없습니다');
      }

      const targetBooking = bookings[targetIndex];
      if (!targetBooking) {
        throw new Error('예약을 찾을 수 없습니다');
      }

      // 중복 예약 체크 (날짜가 변경된 경우에만)
      if (data.startDate || data.endDate) {
        const newStartDate = data.startDate || targetBooking.startDate;
        const newEndDate = data.endDate || targetBooking.endDate;

        // 서버 사이드 시간 검증
        const now = new Date();
        const startDate = parseISO(newStartDate);

        if (!isAfter(startDate, now)) {
          throw new Error('예약 시작 시간은 현재 시간 이후여야 합니다');
        }

        const hasConflict = bookings.some((booking, index) => {
          // 자기 자신은 제외
          if (index === targetIndex) return false;

          // 같은 리소스인지 확인
          if (targetBooking.type === 'vehicle' && booking.type === 'vehicle') {
            if (booking.vehicleId !== targetBooking.vehicleId) return false;
          } else if (targetBooking.type === 'room' && booking.type === 'room') {
            if (booking.roomId !== targetBooking.roomId) return false;
          } else {
            return false;
          }

          return hasDateOverlap(
            booking.startDate,
            booking.endDate,
            newStartDate,
            newEndDate
          );
        });

        if (hasConflict) {
          throw new Error('해당 시간대에 이미 예약이 존재합니다');
        }
      }

      // 업데이트 수행 (타입별로 처리)
      const updatedBooking: Booking =
        targetBooking.type === 'vehicle'
          ? ({
              ...targetBooking,
              ...data,
              updatedAt: new Date().toISOString(),
            } as VehicleBooking)
          : ({
              ...targetBooking,
              ...data,
              updatedAt: new Date().toISOString(),
            } as RoomBooking);

      bookings[targetIndex] = updatedBooking;
      storage.set(STORAGE_KEY, bookings);

      return updatedBooking;
    });
  },

  /**
   * 예약 삭제
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

  /**
   * 다중 차량 예약 생성
   */
  async createMultiVehicleBookings(
    data: MultiVehicleBookingFormData,
    userId: string,
    userName: string,
    vehicleMap: Map<string, { name: string }>
  ): Promise<ApiResponse<MultiBookingResult<VehicleBooking>>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];

      // 서버 사이드 시간 검증
      const now = new Date();
      const startDate = parseISO(data.startDate);

      if (!isAfter(startDate, now)) {
        throw new Error('예약 시작 시간은 현재 시간 이후여야 합니다');
      }

      const succeeded: VehicleBooking[] = [];
      const failed: MultiBookingResult<VehicleBooking>['failed'] = [];

      // 각 차량에 대해 순차적으로 예약 생성
      for (const vehicleId of data.vehicleIds) {
        const vehicleInfo = vehicleMap.get(vehicleId);
        if (!vehicleInfo) {
          failed.push({
            id: vehicleId,
            name: '알 수 없음',
            error: '차량 정보를 찾을 수 없습니다',
          });
          continue;
        }

        // 중복 체크
        const hasConflict = bookings.some((booking) => {
          if (booking.type !== 'vehicle' || booking.vehicleId !== vehicleId) {
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
          failed.push({
            id: vehicleId,
            name: vehicleInfo.name,
            error: '해당 시간대에 이미 예약이 존재합니다',
          });
          continue;
        }

        // 예약 생성
        const newBooking: VehicleBooking = {
          vehicleId,
          vehicleName: vehicleInfo.name,
          startDate: data.startDate,
          endDate: data.endDate,
          destination: data.destination,
          purpose: data.purpose,
          type: 'vehicle',
          id: nanoid(),
          userId,
          userName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        bookings.push(newBooking);
        succeeded.push(newBooking);
      }

      // 성공한 예약 저장
      if (succeeded.length > 0) {
        storage.set(STORAGE_KEY, bookings);
      }

      return { succeeded, failed };
    });
  },

  /**
   * 다중 부속실 예약 생성
   */
  async createMultiRoomBookings(
    data: MultiRoomBookingFormData,
    userId: string,
    userName: string,
    roomMap: Map<string, { name: string }>
  ): Promise<ApiResponse<MultiBookingResult<RoomBooking>>> {
    return simulateApiCall(() => {
      const bookings = storage.get<Booking[]>(STORAGE_KEY) || [];

      // 서버 사이드 시간 검증
      const now = new Date();
      const startDate = parseISO(data.startDate);

      if (!isAfter(startDate, now)) {
        throw new Error('예약 시작 시간은 현재 시간 이후여야 합니다');
      }

      const succeeded: RoomBooking[] = [];
      const failed: MultiBookingResult<RoomBooking>['failed'] = [];

      // 각 부속실에 대해 순차적으로 예약 생성
      for (const roomId of data.roomIds) {
        const roomInfo = roomMap.get(roomId);
        if (!roomInfo) {
          failed.push({
            id: roomId,
            name: '알 수 없음',
            error: '부속실 정보를 찾을 수 없습니다',
          });
          continue;
        }

        // 중복 체크
        const hasConflict = bookings.some((booking) => {
          if (booking.type !== 'room' || booking.roomId !== roomId) {
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
          failed.push({
            id: roomId,
            name: roomInfo.name,
            error: '해당 시간대에 이미 예약이 존재합니다',
          });
          continue;
        }

        // 예약 생성
        const newBooking: RoomBooking = {
          roomId,
          roomName: roomInfo.name,
          startDate: data.startDate,
          endDate: data.endDate,
          attendees: data.attendees,
          purpose: data.purpose,
          type: 'room',
          id: nanoid(),
          userId,
          userName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        bookings.push(newBooking);
        succeeded.push(newBooking);
      }

      // 성공한 예약 저장
      if (succeeded.length > 0) {
        storage.set(STORAGE_KEY, bookings);
      }

      return { succeeded, failed };
    });
  },
};
