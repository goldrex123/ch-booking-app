import { z } from 'zod';
import { isAfter, parseISO } from 'date-fns';

/**
 * 차량 예약 폼 유효성 검사 스키마
 */
export const vehicleBookingSchema = z
  .object({
    vehicleId: z.string().min(1, '차량을 선택해주세요'),
    vehicleName: z.string().min(1, '차량명을 입력해주세요'),
    startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
    endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
    destination: z
      .string()
      .min(1, '목적지를 입력해주세요')
      .max(200, '목적지는 최대 200자까지 가능합니다'),
    purpose: z
      .string()
      .min(1, '사용 목적을 입력해주세요')
      .max(500, '사용 목적은 최대 500자까지 가능합니다'),
  })
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const now = new Date();
        return isAfter(start, now);
      } catch {
        return false;
      }
    },
    {
      message: '시작 날짜는 현재 시간 이후여야 합니다',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const end = parseISO(data.endDate);
        return isAfter(end, start);
      } catch {
        return false;
      }
    },
    {
      message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

/**
 * 부속실 예약 폼 유효성 검사 스키마
 */
export const roomBookingSchema = z
  .object({
    roomId: z.string().min(1, '부속실을 선택해주세요'),
    roomName: z.string().min(1, '부속실명을 입력해주세요'),
    startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
    endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
    attendees: z
      .number()
      .int('정수를 입력해주세요')
      .min(1, '최소 1명 이상이어야 합니다')
      .max(500, '최대 500명까지 가능합니다'),
    purpose: z
      .string()
      .min(1, '사용 목적을 입력해주세요')
      .max(500, '사용 목적은 최대 500자까지 가능합니다'),
  })
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const now = new Date();
        return isAfter(start, now);
      } catch {
        return false;
      }
    },
    {
      message: '시작 날짜는 현재 시간 이후여야 합니다',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const end = parseISO(data.endDate);
        return isAfter(end, start);
      } catch {
        return false;
      }
    },
    {
      message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

/**
 * 차량 예약 수정 스키마
 */
export const vehicleBookingUpdateSchema = z
  .object({
    startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
    endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
    destination: z
      .string()
      .min(1, '목적지를 입력해주세요')
      .max(200, '목적지는 최대 200자까지 가능합니다'),
    purpose: z
      .string()
      .min(1, '사용 목적을 입력해주세요')
      .max(500, '사용 목적은 최대 500자까지 가능합니다'),
  })
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const now = new Date();
        return isAfter(start, now);
      } catch {
        return false;
      }
    },
    {
      message: '시작 날짜는 현재 시간 이후여야 합니다',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const end = parseISO(data.endDate);
        return isAfter(end, start);
      } catch {
        return false;
      }
    },
    {
      message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

/**
 * 부속실 예약 수정 스키마
 */
export const roomBookingUpdateSchema = z
  .object({
    startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
    endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
    attendees: z
      .number()
      .int('정수를 입력해주세요')
      .min(1, '최소 1명 이상이어야 합니다')
      .max(500, '최대 500명까지 가능합니다'),
    purpose: z
      .string()
      .min(1, '사용 목적을 입력해주세요')
      .max(500, '사용 목적은 최대 500자까지 가능합니다'),
  })
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const now = new Date();
        return isAfter(start, now);
      } catch {
        return false;
      }
    },
    {
      message: '시작 날짜는 현재 시간 이후여야 합니다',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const end = parseISO(data.endDate);
        return isAfter(end, start);
      } catch {
        return false;
      }
    },
    {
      message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

/**
 * 차량 예약 폼 값 타입
 */
export type VehicleBookingFormValues = z.infer<typeof vehicleBookingSchema>;

/**
 * 부속실 예약 폼 값 타입
 */
export type RoomBookingFormValues = z.infer<typeof roomBookingSchema>;

/**
 * 차량 예약 수정 폼 값 타입
 */
export type VehicleBookingUpdateValues = z.infer<
  typeof vehicleBookingUpdateSchema
>;

/**
 * 부속실 예약 수정 폼 값 타입
 */
export type RoomBookingUpdateValues = z.infer<typeof roomBookingUpdateSchema>;

/**
 * 다중 차량 예약 폼 유효성 검사 스키마
 */
export const multiVehicleBookingSchema = z
  .object({
    vehicleIds: z
      .array(z.string())
      .min(1, '최소 1개 이상의 차량을 선택해주세요')
      .max(10, '최대 10개까지 선택 가능합니다'),
    startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
    endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
    destination: z
      .string()
      .min(1, '목적지를 입력해주세요')
      .max(200, '목적지는 최대 200자까지 가능합니다'),
    purpose: z
      .string()
      .min(1, '사용 목적을 입력해주세요')
      .max(500, '사용 목적은 최대 500자까지 가능합니다'),
  })
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const now = new Date();
        return isAfter(start, now);
      } catch {
        return false;
      }
    },
    {
      message: '시작 날짜는 현재 시간 이후여야 합니다',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const end = parseISO(data.endDate);
        return isAfter(end, start);
      } catch {
        return false;
      }
    },
    {
      message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

/**
 * 다중 부속실 예약 폼 유효성 검사 스키마
 */
export const multiRoomBookingSchema = z
  .object({
    roomIds: z
      .array(z.string())
      .min(1, '최소 1개 이상의 부속실을 선택해주세요')
      .max(10, '최대 10개까지 선택 가능합니다'),
    startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
    endDate: z.string().min(1, '종료 날짜를 선택해주세요'),
    attendees: z
      .number()
      .int('정수를 입력해주세요')
      .min(1, '최소 1명 이상이어야 합니다')
      .max(500, '최대 500명까지 가능합니다'),
    purpose: z
      .string()
      .min(1, '사용 목적을 입력해주세요')
      .max(500, '사용 목적은 최대 500자까지 가능합니다'),
  })
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const now = new Date();
        return isAfter(start, now);
      } catch {
        return false;
      }
    },
    {
      message: '시작 날짜는 현재 시간 이후여야 합니다',
      path: ['startDate'],
    }
  )
  .refine(
    (data) => {
      try {
        const start = parseISO(data.startDate);
        const end = parseISO(data.endDate);
        return isAfter(end, start);
      } catch {
        return false;
      }
    },
    {
      message: '종료 날짜는 시작 날짜보다 이후여야 합니다',
      path: ['endDate'],
    }
  );

/**
 * 다중 차량 예약 폼 값 타입
 */
export type MultiVehicleBookingFormValues = z.infer<
  typeof multiVehicleBookingSchema
>;

/**
 * 다중 부속실 예약 폼 값 타입
 */
export type MultiRoomBookingFormValues = z.infer<typeof multiRoomBookingSchema>;
