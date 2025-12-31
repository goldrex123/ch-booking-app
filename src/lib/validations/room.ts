import { z } from 'zod';

/**
 * 부속실 폼 유효성 검사 스키마
 */
export const roomSchema = z.object({
  name: z
    .string()
    .min(1, '부속실명을 입력해주세요')
    .max(50, '부속실명은 최대 50자까지 가능합니다'),
  location: z
    .string()
    .min(1, '위치를 입력해주세요')
    .max(100, '위치는 최대 100자까지 가능합니다'),
  status: z.enum(['available', 'in-use', 'maintenance']),
  description: z
    .string()
    .max(500, '설명은 최대 500자까지 가능합니다')
    .optional()
    .or(z.literal('')),
});

/**
 * 부속실 폼 값 타입
 */
export type RoomFormValues = z.infer<typeof roomSchema>;
