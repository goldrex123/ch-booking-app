import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Room } from '@/types';

/**
 * 부속실 스토어 상태
 */
interface RoomStore {
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;

  // Actions
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  selectRoom: (room: Room | null) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * 부속실 스토어
 * immer 미들웨어를 사용하여 불변성 관리
 */
export const useRoomStore = create<RoomStore>()(
  immer((set) => ({
    rooms: [],
    selectedRoom: null,
    isLoading: false,

    setRooms: (rooms) =>
      set((state) => {
        state.rooms = rooms;
      }),

    addRoom: (room) =>
      set((state) => {
        state.rooms.push(room);
      }),

    updateRoom: (id, roomData) =>
      set((state) => {
        const index = state.rooms.findIndex((r) => r.id === id);
        if (index !== -1) {
          const room = state.rooms[index]!;
          Object.assign(room, roomData, {
            updatedAt: new Date().toISOString(),
          });
        }
      }),

    deleteRoom: (id) =>
      set((state) => {
        state.rooms = state.rooms.filter((r) => r.id !== id);
      }),

    selectRoom: (room) =>
      set((state) => {
        state.selectedRoom = room;
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),
  }))
);
