import type { Room, RoomFormData } from '@/types';
import { storage, simulateApiCall, type ApiResponse } from './client';
import { INITIAL_ROOMS } from '../constants';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'rooms';

/**
 * 부속실 API
 */
export const roomApi = {
  /**
   * 부속실 목록 조회
   */
  async getAll(): Promise<ApiResponse<Room[]>> {
    return simulateApiCall(() => {
      const rooms = storage.get<Room[]>(STORAGE_KEY);
      if (!rooms) {
        // 초기 데이터가 없으면 INITIAL_ROOMS로 초기화
        storage.set(STORAGE_KEY, INITIAL_ROOMS);
        return INITIAL_ROOMS;
      }
      return rooms;
    });
  },

  /**
   * 부속실 상세 조회
   */
  async getById(id: string): Promise<ApiResponse<Room>> {
    return simulateApiCall(() => {
      const rooms = storage.get<Room[]>(STORAGE_KEY) || [];
      const room = rooms.find((r) => r.id === id);

      if (!room) {
        throw new Error('부속실을 찾을 수 없습니다');
      }

      return room;
    });
  },

  /**
   * 부속실 생성
   */
  async create(data: RoomFormData): Promise<ApiResponse<Room>> {
    return simulateApiCall(() => {
      const rooms = storage.get<Room[]>(STORAGE_KEY) || [];

      // 부속실명 중복 체크
      const isDuplicate = rooms.some(
        (r) => r.name === data.name && r.location === data.location
      );
      if (isDuplicate) {
        throw new Error('같은 위치에 동일한 이름의 부속실이 이미 존재합니다');
      }

      const newRoom: Room = {
        ...data,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      rooms.push(newRoom);
      storage.set(STORAGE_KEY, rooms);

      return newRoom;
    });
  },

  /**
   * 부속실 수정
   */
  async update(
    id: string,
    data: Partial<RoomFormData>
  ): Promise<ApiResponse<Room>> {
    return simulateApiCall(() => {
      const rooms = storage.get<Room[]>(STORAGE_KEY) || [];
      const index = rooms.findIndex((r) => r.id === id);

      if (index === -1) {
        throw new Error('부속실을 찾을 수 없습니다');
      }

      const currentRoom = rooms[index]!;

      // 부속실명 중복 체크 (자기 자신 제외)
      if (data.name || data.location) {
        const targetName = data.name || currentRoom.name;
        const targetLocation = data.location || currentRoom.location;

        const isDuplicate = rooms.some(
          (r) =>
            r.name === targetName &&
            r.location === targetLocation &&
            r.id !== id
        );
        if (isDuplicate) {
          throw new Error('같은 위치에 동일한 이름의 부속실이 이미 존재합니다');
        }
      }

      const updatedRoom: Room = {
        ...currentRoom,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      rooms[index] = updatedRoom;
      storage.set(STORAGE_KEY, rooms);

      return updatedRoom;
    });
  },

  /**
   * 부속실 삭제
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return simulateApiCall(() => {
      const rooms = storage.get<Room[]>(STORAGE_KEY) || [];
      const filtered = rooms.filter((r) => r.id !== id);

      if (filtered.length === rooms.length) {
        throw new Error('부속실을 찾을 수 없습니다');
      }

      storage.set(STORAGE_KEY, filtered);
      return undefined;
    });
  },
};
