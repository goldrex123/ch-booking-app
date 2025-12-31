import { z } from 'zod';

/**
 * 차량 폼 유효성 검사 스키마
 */
export const vehicleSchema = z.object({
  name: z
    .string()
    .min(1, '차량명을 입력해주세요')
    .max(50, '차량명은 최대 50자까지 가능합니다'),
  licensePlate: z
    .string()
    .min(1, '차량번호를 입력해주세요')
    .regex(/^\d{2,3}[가-힣]\s?\d{4}$/, '올바른 차량번호 형식이 아닙니다 (예: 12가 3456)'),
  type: z.enum(['sedan', 'suv', 'van', 'truck']),
  capacity: z
    .number()
    .int('정수를 입력해주세요')
    .min(1, '최소 1명 이상이어야 합니다')
    .max(50, '최대 50명까지 가능합니다'),
  status: z.enum(['available', 'in-use', 'maintenance']),
  description: z
    .string()
    .max(500, '설명은 최대 500자까지 가능합니다')
    .optional()
    .or(z.literal('')),
});

/**
 * 차량 폼 값 타입
 */
export type VehicleFormValues = z.infer<typeof vehicleSchema>;
