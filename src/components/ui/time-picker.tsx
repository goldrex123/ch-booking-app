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
}

export function TimePicker({
  value = '09:00',
  onSelect,
  disabled = false,
  className,
}: TimePickerProps) {
  // value를 시간과 분으로 파싱
  const [hour, minute] = value.split(':').map((v) => v.padStart(2, '0'));

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
            <SelectItem key={h} value={h.toString().padStart(2, '0')}>
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
            <SelectItem key={m} value={m.toString().padStart(2, '0')}>
              {m.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
