import { ScheduledBlock } from '@/types/block';
import { BreakBlock } from '@/engine/break-calculator';
import { TimeGrid } from './TimeGrid';
import { useDroppable } from '@dnd-kit/core';

interface DayColumnProps {
  date: string; // YYYY-MM-DD
  dateObj: Date;
  blocks: ScheduledBlock[];
  breaks: BreakBlock[];
  isToday: boolean;
  onDateClick: (date: string) => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function DayColumn({ date, dateObj, blocks, breaks, isToday, onDateClick }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: date,
    data: { type: 'day', date },
  });

  return (
    <div 
      className={`day-column ${isOver ? 'day-column--drag-over' : ''}`} 
      ref={setNodeRef}
    >
      <div className="day-column__header">
        <span className="day-column__weekday">{WEEKDAYS[dateObj.getDay()]}</span>
        <button 
          className={`day-column__date ${isToday ? 'day-column__date--today' : ''}`}
          onClick={() => onDateClick(date)}
        >
          {dateObj.getDate()}
        </button>
      </div>
      
      <TimeGrid 
        date={date}
        blocks={blocks}
        breaks={breaks}
        isToday={isToday}
      />
    </div>
  );
}
