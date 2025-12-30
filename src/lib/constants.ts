import type { User, Vehicle, Room } from '@/types';

/**
 * Mock 사용자 계정 (테스트용)
 */
export const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: 'user-1',
    username: 'admin',
    password: 'admin123',
    name: '관리자',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    username: 'user1',
    password: 'user123',
    name: '김철수',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    username: 'user2',
    password: 'user123',
    name: '이영희',
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

/**
 * 초기 차량 데이터
 */
export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'vehicle-1',
    name: '소나타',
    licensePlate: '12가 3456',
    type: 'sedan',
    capacity: 5,
    status: 'available',
    description: '업무용 세단',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vehicle-2',
    name: '그랜저',
    licensePlate: '34나 5678',
    type: 'sedan',
    capacity: 5,
    status: 'available',
    description: '중형 세단',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vehicle-3',
    name: '카니발',
    licensePlate: '56다 7890',
    type: 'van',
    capacity: 11,
    status: 'available',
    description: '대형 승합차',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vehicle-4',
    name: '팰리세이드',
    licensePlate: '78라 1234',
    type: 'suv',
    capacity: 7,
    status: 'available',
    description: '대형 SUV',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vehicle-5',
    name: '포터',
    licensePlate: '90마 5678',
    type: 'truck',
    capacity: 2,
    status: 'maintenance',
    description: '화물 운송용',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * 초기 부속실 데이터
 */
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    name: '회의실 A',
    location: '본관 2층',
    capacity: 10,
    facilities: ['프로젝터', '화이트보드', '화상회의'],
    status: 'available',
    description: '중규모 회의실',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room-2',
    name: '회의실 B',
    location: '본관 3층',
    capacity: 6,
    facilities: ['TV', '화이트보드'],
    status: 'available',
    description: '소규모 회의실',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room-3',
    name: '대회의실',
    location: '본관 5층',
    capacity: 50,
    facilities: ['프로젝터', '음향시설', '화상회의', '무선마이크'],
    status: 'available',
    description: '대형 회의실 / 세미나실',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room-4',
    name: '교육실',
    location: '별관 1층',
    capacity: 30,
    facilities: ['프로젝터', '화이트보드', '책상'],
    status: 'available',
    description: '교육 및 워크샵용',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room-5',
    name: '휴게실',
    location: '본관 1층',
    capacity: 20,
    facilities: ['소파', '커피머신', 'TV'],
    status: 'in-use',
    description: '직원 휴게 공간',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * 차량 유형 라벨
 */
export const VEHICLE_TYPE_LABELS: Record<Vehicle['type'], string> = {
  sedan: '세단',
  suv: 'SUV',
  van: '승합차',
  truck: '트럭',
};

/**
 * 차량 상태 라벨
 */
export const VEHICLE_STATUS_LABELS: Record<Vehicle['status'], string> = {
  available: '사용 가능',
  'in-use': '사용 중',
  maintenance: '정비 중',
};

/**
 * 부속실 상태 라벨
 */
export const ROOM_STATUS_LABELS: Record<Room['status'], string> = {
  available: '사용 가능',
  'in-use': '사용 중',
  maintenance: '정비 중',
};

/**
 * 일반적인 부속실 시설 목록
 */
export const COMMON_FACILITIES = [
  '프로젝터',
  '화이트보드',
  '화상회의',
  'TV',
  '음향시설',
  '무선마이크',
  '책상',
  '소파',
  '커피머신',
  'WiFi',
] as const;

/**
 * LocalStorage 키 상수
 */
export const STORAGE_KEYS = {
  AUTH: 'auth-storage',
  VEHICLES: 'vehicles',
  BOOKINGS: 'bookings',
  ROOMS: 'rooms',
} as const;
