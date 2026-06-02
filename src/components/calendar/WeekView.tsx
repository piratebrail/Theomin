import { getLocalDateString } from '@/utils/date';
import { useCalendarStore } from '@/stores/calendarStore';
import { ScheduledBlock } from '@/types/block';
import { BreakBlock } from '@/engine/break-calculator';
import { DayColumn } from './DayColumn';

interface WeekViewProps {
  blocks: ScheduledBlock[];
  breaks: BreakBlock[];
}

function getWeekDates(currentDateStr: string): Date[] {
  const current = new Date(currentDateStr + 'T00:00:00');
  const day = current.getDay();
  const diff = current.getDate() - day; // Ir para domingo
  
  const startOfWeek = new Date(current.setDate(diff));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function WeekView({ blocks, breaks }: WeekViewProps) {
  const { currentDate, setViewType, setCurrentDate } = useCalendarStore();
  const weekDates = getWeekDates(currentDate);
  const todayStr = getLocalDateString();
  
  const handleDateClick = (date: string) => {
    setCurrentDate(date);
    setViewType('day');
  };
  
  return (
    <div className="week-view">
      {weekDates.map(dateObj => {
        const dateStr = getLocalDateString(dateObj);
        const isPast = dateStr < todayStr;
        const dayBlocks = blocks.filter(b => b.date === dateStr && (!isPast || b.status === 'completed'));
        const dayBreaks = breaks.filter(b => b.date === dateStr);
        
        return (
          <DayColumn
            key={dateStr}
            date={dateStr}
            dateObj={dateObj}
            blocks={dayBlocks}
            breaks={dayBreaks}
            isToday={dateStr === todayStr}
            onDateClick={handleDateClick}
          />
        );
      })}
    </div>
  );
}
