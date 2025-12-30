'use client';

import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import type { CalendarEvent } from './utils';
import { BOOKING_EVENT_COLOR } from './utils';

const locales = { ko };

// date-fns 로컬라이저 설정
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // 일요일 시작
  getDay,
  locales,
});

interface BookingCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  className?: string;
}

export function BookingCalendar({
  events,
  onSelectEvent,
  className,
}: BookingCalendarProps) {
  // 제어되는 컴포넌트를 위한 상태 관리
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  // 이벤트 스타일 적용 (모든 예약 단일 색상)
  const eventStyleGetter = () => {
    return {
      style: {
        backgroundColor: BOOKING_EVENT_COLOR.bg,
        borderColor: BOOKING_EVENT_COLOR.border,
        color: BOOKING_EVENT_COLOR.text,
        borderWidth: '1px',
        borderStyle: 'solid',
      },
    };
  };

  // 한글 메시지
  const messages = {
    today: '오늘',
    previous: '이전',
    next: '다음',
    month: '월',
    week: '주',
    day: '일',
    agenda: '일정',
    date: '날짜',
    time: '시간',
    event: '이벤트',
    allDay: '종일',
    yesterday: '어제',
    tomorrow: '내일',
    noEventsInRange: '해당 기간에 예약이 없습니다',
    showMore: (total: number) => `+${total} 더보기`,
  };

  return (
    <div className={className}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={currentView}
        onView={setCurrentView}
        date={currentDate}
        onNavigate={setCurrentDate}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        messages={messages}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
        popup
        tooltipAccessor={(event) => event.title}
      />
    </div>
  );
}
