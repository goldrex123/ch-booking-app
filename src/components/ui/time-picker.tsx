'use client';

import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimePickerProps {
  value?: string; // HH:mm 형식
  onSelect?: (time: string) => void;
  disabled?: boolean;
  className?: string;
  selectedDate?: Date; // 선택된 날짜
  disablePastTimes?: boolean; // 과거 시간 비활성화
}

export function TimePicker({
  value = '09:00',
  onSelect,
  disabled = false,
  className,
  selectedDate,
  disablePastTimes = false,
}: TimePickerProps) {
  // value를 시간과 분으로 파싱
  const parts = value.split(':').map((v) => v.padStart(2, '0'));
  const hour = parts[0] || '09';
  const minute = parts[1] || '00';

  // 현재 시간 가져오기
  const now = new Date();

  // 오늘인지 체크
  const isToday =
    selectedDate &&
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  // 시간 비활성화 체크
  const isHourDisabled = (h: number): boolean => {
    if (!disablePastTimes || !isToday) return false;
    return h < now.getHours();
  };

  // 분 비활성화 체크
  const isMinuteDisabled = (m: number): boolean => {
    if (!disablePastTimes || !isToday) return false;
    const selectedHour = parseInt(hour, 10);
    if (selectedHour > now.getHours()) return false;
    if (selectedHour === now.getHours()) {
      return m < now.getMinutes();
    }
    return false;
  };

  // 시간 변경 핸들러
  const handleHourChange = (newHour: string) => {
    const formattedTime = `${newHour.padStart(2, '0')}:${minute}`;
    onSelect?.(formattedTime);
  };

  // 분 변경 핸들러
  const handleMinuteChange = (newMinute: string) => {
    const formattedTime = `${hour}:${newMinute.padStart(2, '0')}`;
    onSelect?.(formattedTime);
  };

  // 0-23 시간 배열 생성
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // 30분 단위 (0, 30)
  const minutes = [0, 30];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 시간 선택 */}
      <Select
        value={hour}
        onValueChange={handleHourChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="시" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem
              key={h}
              value={h.toString().padStart(2, '0')}
              disabled={isHourDisabled(h)}
            >
              {h.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-muted-foreground">:</span>

      {/* 분 선택 */}
      <Select
        value={minute}
        onValueChange={handleMinuteChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="분" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem
              key={m}
              value={m.toString().padStart(2, '0')}
              disabled={isMinuteDisabled(m)}
            >
              {m.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
