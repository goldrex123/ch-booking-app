/**
 * 예약 타입 (차량 또는 부속실)
 */
export type BookingType = 'vehicle' | 'room';

/**
 * 기본 예약 정보 (공통 필드)
 */
export interface BaseBooking {
  id: string;
  type: BookingType;
  userId: string;
  userName: string;
  startDate: string; // ISO 8601 형식
  endDate: string;   // ISO 8601 형식
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 차량 예약 정보
 */
export interface VehicleBooking extends BaseBooking {
  type: 'vehicle';
  vehicleId: string;
  vehicleName: string;
  destination: string;
}

/**
 * 부속실 예약 정보
 */
export interface RoomBooking extends BaseBooking {
  type: 'room';
  roomId: string;
  roomName: string;
  attendees: number;
}

/**
 * 통합 예약 타입 (Union type)
 */
export type Booking = VehicleBooking | RoomBooking;

/**
 * 차량 예약 폼 데이터 타입
 */
export type VehicleBookingFormData = Omit<
  VehicleBooking,
  'id' | 'type' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'
>;

/**
 * 부속실 예약 폼 데이터 타입
 */
export type RoomBookingFormData = Omit<
  RoomBooking,
  'id' | 'type' | 'userId' | 'userName' | 'createdAt' | 'updatedAt'
>;

/**
 * 다중 차량 예약 폼 데이터
 */
export type MultiVehicleBookingFormData = {
  vehicleIds: string[];
  startDate: string;
  endDate: string;
  destination: string;
  purpose: string;
};

/**
 * 다중 부속실 예약 폼 데이터
 */
export type MultiRoomBookingFormData = {
  roomIds: string[];
  startDate: string;
  endDate: string;
  attendees: number;
  purpose: string;
};
