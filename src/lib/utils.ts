import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 두 날짜의 날짜 부분만 비교 (시간 제외)
 * @param date - 비교할 날짜
 * @param compareDate - 기준 날짜
 * @returns date가 compareDate보다 이전이면 true
 */
export function isDateBefore(date: Date, compareDate: Date): boolean {
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const compareDateOnly = new Date(
    compareDate.getFullYear(),
    compareDate.getMonth(),
    compareDate.getDate()
  );
  return dateOnly < compareDateOnly;
}

/**
 * 오늘보다 이전 날짜인지 확인 (시간 제외)
 * @param date - 확인할 날짜
 * @returns 오늘보다 이전이면 true
 */
export function isBeforeToday(date: Date): boolean {
  return isDateBefore(date, new Date());
}

/**
 * 현재 시간을 다음 30분 단위로 올림
 * @returns HH:mm 형식 문자열
 * @example
 * - 14:37 → '15:00'
 * - 15:00 → '15:00'
 * - 23:45 → '00:00' (다음날)
 */
export function getNextHalfHourTime(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  // 30분 단위로 올림 (0, 30)
  let nextMinutes: number;
  let nextHours: number;

  if (minutes === 0) {
    nextMinutes = 0;
    nextHours = hours;
  } else if (minutes <= 30) {
    nextMinutes = 30;
    nextHours = hours;
  } else {
    // 30분 초과: 다음 시간의 00분
    nextMinutes = 0;
    nextHours = hours + 1;
  }

  // 24시간 넘어가는 경우 처리 (23:45 → 00:00)
  if (nextHours >= 24) {
    nextHours = 0;
  }

  return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`;
}
