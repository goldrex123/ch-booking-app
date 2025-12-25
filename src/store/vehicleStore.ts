import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Vehicle } from '@/types';

/**
 * 차량 스토어 상태
 */
interface VehicleStore {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;

  // Actions
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  selectVehicle: (vehicle: Vehicle | null) => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * 차량 스토어
 * immer 미들웨어를 사용하여 불변성 관리
 */
export const useVehicleStore = create<VehicleStore>()(
  immer((set) => ({
    vehicles: [],
    selectedVehicle: null,
    isLoading: false,

    setVehicles: (vehicles) =>
      set((state) => {
        state.vehicles = vehicles;
      }),

    addVehicle: (vehicle) =>
      set((state) => {
        state.vehicles.push(vehicle);
      }),

    updateVehicle: (id, vehicleData) =>
      set((state) => {
        const index = state.vehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          const vehicle = state.vehicles[index]!;
          Object.assign(vehicle, vehicleData, {
            updatedAt: new Date().toISOString(),
          });
        }
      }),

    deleteVehicle: (id) =>
      set((state) => {
        state.vehicles = state.vehicles.filter((v) => v.id !== id);
      }),

    selectVehicle: (vehicle) =>
      set((state) => {
        state.selectedVehicle = vehicle;
      }),

    setLoading: (isLoading) =>
      set((state) => {
        state.isLoading = isLoading;
      }),
  }))
);
