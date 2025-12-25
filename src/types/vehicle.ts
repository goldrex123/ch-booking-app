/**
 * 차량 타입
 */
export type VehicleType = 'sedan' | 'suv' | 'van' | 'truck';

/**
 * 차량 상태
 */
export type VehicleStatus = 'available' | 'in-use' | 'maintenance';

/**
 * 차량 정보 타입
 */
export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: VehicleType;
  capacity: number;
  status: VehicleStatus;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 차량 폼 데이터 타입 (생성/수정 시 사용)
 */
export type VehicleFormData = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
