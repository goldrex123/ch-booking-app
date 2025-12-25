import { z } from 'zod';

/**
 * 로그인 폼 유효성 검사 스키마
 */
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, '아이디는 최소 3자 이상이어야 합니다')
    .max(20, '아이디는 최대 20자까지 가능합니다'),
  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .max(50, '비밀번호는 최대 50자까지 가능합니다'),
});

/**
 * 로그인 폼 값 타입
 */
export type LoginFormValues = z.infer<typeof loginSchema>;
