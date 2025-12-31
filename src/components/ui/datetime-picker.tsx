'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn, getNextHalfHourTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimePicker } from '@/components/ui/time-picker';

interface DateTimePickerProps {
  value?: string; // ISO 8601 형식
  onChange?: (value: string) => void;
  disabled?: boolean;
  disabledDates?: (date: Date) => boolean;
  placeholder?: string;
  className?: string;
}

// ISO 문자열 → 날짜 + 시간
function parseDateTime(iso: string): { date: Date; time: string } {
  const d = new Date(iso);
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  return { date: d, time };
}

// 날짜 + 시간 → ISO 문자열
function combineDateTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    0,
    0
  );
  return combined.toISOString();
}

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  disabledDates,
  placeholder = '날짜와 시간 선택',
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'date' | 'time'>('date');

  // 현재 값 파싱
  const currentValue = value ? parseDateTime(value) : null;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentValue?.date
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    currentValue?.time || getNextHalfHourTime()
  );

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setStep('time');
  };

  // 시간 선택 핸들러
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      const iso = combineDateTime(selectedDate, time);
      onChange?.(iso);
      setOpen(false);
      setStep('date');
    }
  };

  // 팝오버 닫기 시 초기화
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStep('date');
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value
            ? format(new Date(value), 'PPP p', { locale: ko })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="space-y-4 p-4">
          {step === 'date' && (
            <>
              <div className="text-sm font-medium">날짜 선택</div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={disabledDates}
                initialFocus
              />
            </>
          )}
          {step === 'time' && (
            <>
              <div className="text-sm font-medium">시간 선택</div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {selectedDate &&
                    format(selectedDate, 'PPP', { locale: ko })}
                </div>
                <TimePicker
                  value={selectedTime}
                  onSelect={handleTimeSelect}
                  className="justify-center"
                  selectedDate={selectedDate}
                  disablePastTimes={true}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('date')}
                  >
                    이전
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleTimeSelect(selectedTime)}
                  >
                    확인
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
