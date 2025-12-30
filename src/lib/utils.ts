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
