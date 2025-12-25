/**
 * 타입 통합 export
 */

// 인증 관련 타입
export type { User, LoginCredentials, AuthState } from './auth';

// 차량 관련 타입
export type {
  Vehicle,
  VehicleFormData,
  VehicleType,
  VehicleStatus,
} from './vehicle';

// 부속실 관련 타입
export type { Room, RoomFormData, RoomStatus } from './room';

// 예약 관련 타입
export type {
  Booking,
  VehicleBooking,
  RoomBooking,
  VehicleBookingFormData,
  RoomBookingFormData,
  BookingType,
  BookingStatus,
} from './booking';
