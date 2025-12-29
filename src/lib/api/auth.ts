import type { User, LoginCredentials } from '@/types';
import { storage, simulateApiCall, type ApiResponse } from './client';
import { MOCK_USERS } from '../constants';

/**
 * 인증 API
 */
export const authApi = {
  /**
   * 로그인
   */
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    return simulateApiCall(() => {
      const user = MOCK_USERS.find(
        (u) =>
          u.username === credentials.username &&
          u.password === credentials.password
      );

      if (!user) {
        throw new Error('아이디 또는 비밀번호가 올바르지 않습니다');
      }

      const { password: _password, ...userWithoutPassword } = user;

      // Mock JWT 토큰 생성
      const token = `mock-jwt-token-${user.id}-${Date.now()}`;

      return {
        user: userWithoutPassword as User,
        token,
      };
    });
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<ApiResponse<void>> {
    return simulateApiCall(() => {
      // Zustand persist에서 관리하므로 별도 처리 불필요
      return undefined;
    });
  },

  /**
   * 토큰 검증
   */
  async verifyToken(token: string): Promise<ApiResponse<User>> {
    return simulateApiCall(() => {
      // Mock 토큰 검증
      if (!token.startsWith('mock-jwt-token-')) {
        throw new Error('유효하지 않은 토큰입니다');
      }

      // 토큰에서 userId 추출
      const parts = token.split('-');
      const userId = parts[3];

      const user = MOCK_USERS.find((u) => u.id === userId);

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다');
      }

      const { password: _password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    });
  },
};
