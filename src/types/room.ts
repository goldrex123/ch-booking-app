/**
 * 부속실 상태
 */
export type RoomStatus = 'available' | 'in-use' | 'maintenance';

/**
 * 부속실 정보 타입
 */
export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  status: RoomStatus;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 부속실 폼 데이터 타입 (생성/수정 시 사용)
 */
export type RoomFormData = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>;
