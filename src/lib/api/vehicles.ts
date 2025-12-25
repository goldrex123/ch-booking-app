import type { Vehicle, VehicleFormData } from '@/types';
import { storage, simulateApiCall, type ApiResponse } from './client';
import { INITIAL_VEHICLES } from '../constants';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'vehicles';

/**
 * 차량 API
 */
export const vehicleApi = {
  /**
   * 차량 목록 조회
   */
  async getAll(): Promise<ApiResponse<Vehicle[]>> {
    return simulateApiCall(() => {
      const vehicles = storage.get<Vehicle[]>(STORAGE_KEY);
      if (!vehicles) {
        // 초기 데이터가 없으면 INITIAL_VEHICLES로 초기화
        storage.set(STORAGE_KEY, INITIAL_VEHICLES);
        return INITIAL_VEHICLES;
      }
      return vehicles;
    });
  },

  /**
   * 차량 상세 조회
   */
  async getById(id: string): Promise<ApiResponse<Vehicle>> {
    return simulateApiCall(() => {
      const vehicles = storage.get<Vehicle[]>(STORAGE_KEY) || [];
      const vehicle = vehicles.find((v) => v.id === id);

      if (!vehicle) {
        throw new Error('차량을 찾을 수 없습니다');
      }

      return vehicle;
    });
  },

  /**
   * 차량 생성
   */
  async create(data: VehicleFormData): Promise<ApiResponse<Vehicle>> {
    return simulateApiCall(() => {
      const vehicles = storage.get<Vehicle[]>(STORAGE_KEY) || [];

      // 차량번호 중복 체크
      const isDuplicate = vehicles.some(
        (v) => v.licensePlate === data.licensePlate
      );
      if (isDuplicate) {
        throw new Error('이미 등록된 차량번호입니다');
      }

      const newVehicle: Vehicle = {
        ...data,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vehicles.push(newVehicle);
      storage.set(STORAGE_KEY, vehicles);

      return newVehicle;
    });
  },

  /**
   * 차량 수정
   */
  async update(
    id: string,
    data: Partial<VehicleFormData>
  ): Promise<ApiResponse<Vehicle>> {
    return simulateApiCall(() => {
      const vehicles = storage.get<Vehicle[]>(STORAGE_KEY) || [];
      const index = vehicles.findIndex((v) => v.id === id);

      if (index === -1) {
        throw new Error('차량을 찾을 수 없습니다');
      }

      const currentVehicle = vehicles[index]!;

      // 차량번호 중복 체크 (자기 자신 제외)
      if (data.licensePlate) {
        const isDuplicate = vehicles.some(
          (v) => v.licensePlate === data.licensePlate && v.id !== id
        );
        if (isDuplicate) {
          throw new Error('이미 등록된 차량번호입니다');
        }
      }

      const updatedVehicle: Vehicle = {
        ...currentVehicle,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      vehicles[index] = updatedVehicle;
      storage.set(STORAGE_KEY, vehicles);

      return updatedVehicle;
    });
  },

  /**
   * 차량 삭제
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return simulateApiCall(() => {
      const vehicles = storage.get<Vehicle[]>(STORAGE_KEY) || [];
      const filtered = vehicles.filter((v) => v.id !== id);

      if (filtered.length === vehicles.length) {
        throw new Error('차량을 찾을 수 없습니다');
      }

      storage.set(STORAGE_KEY, filtered);
      return undefined;
    });
  },
};
