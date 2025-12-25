/**
 * 사용자 정보 타입
 */
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

/**
 * 로그인 자격 증명 타입
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * 인증 상태 타입
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
