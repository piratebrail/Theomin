import { getLocalDateString } from '@/utils/date';
import { useCalendarStore } from '@/stores/calendarStore';
import { ScheduledBlock } from '@/types/block';
import { BreakBlock } from '@/engine/break-calculator';
import { DayColumn } from './DayColumn';

interface DayViewProps {
  blocks: ScheduledBlock[];
  breaks: BreakBlock[];
}

export function DayView({ blocks, breaks }: DayViewProps) {
  const { currentDate } = useCalendarStore();
  const dateObj = new Date(currentDate + 'T00:00:00');
  const todayStr = getLocalDateString();
  
  const isPast = currentDate < todayStr;
  const dayBlocks = blocks.filter(b => b.date === currentDate && (!isPast || b.status === 'completed'));
  const dayBreaks = breaks.filter(b => b.date === currentDate);
  
  return (
    <div className="day-view" style={{ flex: 1, display: 'flex' }}>
      <DayColumn
        date={currentDate}
        dateObj={dateObj}
        blocks={dayBlocks}
        breaks={dayBreaks}
        isToday={currentDate === todayStr}
        onDateClick={() => {}}
      />
    </div>
  );
}
