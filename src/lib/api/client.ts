/**
 * API 클라이언트 - localStorage 기반
 *
 * 추후 Spring Boot API로 교체 시 이 파일만 수정하면 됩니다.
 */

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * localStorage 클라이언트 클래스
 * 실제 API와 유사한 인터페이스 제공
 */
export class StorageClient {
  private prefix = 'ch-booking-';

  /**
   * 데이터 조회
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Storage get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 데이터 저장
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage set error for key ${key}:`, error);
    }
  }

  /**
   * 데이터 삭제
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Storage remove error for key ${key}:`, error);
    }
  }

  /**
   * 모든 앱 데이터 삭제
   */
  clear(): void {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.prefix))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Storage clear error:', error);
    }
  }
}

/**
 * 글로벌 storage 인스턴스
 */
export const storage = new StorageClient();

/**
 * API 호출 시뮬레이션 함수
 * 실제 API 호출처럼 비동기로 동작하며 300ms 지연 추가
 *
 * @param fn - 실행할 함수
 * @param delay - 지연 시간 (ms)
 * @returns API 응답
 */
export const simulateApiCall = <T>(
  fn: () => T,
  delay = 300
): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const data = fn();
        resolve({ success: true, data });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '오류가 발생했습니다';
        console.error('API call error:', error);
        resolve({
          success: false,
          error: errorMessage,
        });
      }
    }, delay);
  });
};
