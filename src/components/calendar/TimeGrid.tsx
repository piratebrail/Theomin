import { getLocalDateString } from '@/utils/date';
import { useEffect, useRef, useMemo } from 'react';
import { ScheduledBlock } from '@/types/block';
import { BreakBlock as BreakBlockType } from '@/engine/break-calculator';
import { TaskBlock } from './TaskBlock';
import { BreakBlock } from './BreakBlock';
import { NowIndicator } from './NowIndicator';
import { timeToMinutes, minutesToTime } from '@/utils/validation';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import { TimeSlot } from '@/types/availability';

interface TimeGridProps {
  date: string;
  blocks: ScheduledBlock[];
  breaks: BreakBlockType[];
  isToday: boolean;
}

function timeToPixels(time: string, hourHeight: number): number {
  const minutes = timeToMinutes(time);
  return (minutes / 60) * hourHeight;
}

function blockHeight(durationMinutes: number, hourHeight: number): number {
  return (durationMinutes / 60) * hourHeight;
}

export function TimeGrid({ date, blocks, breaks, isToday }: TimeGridProps) {
  const hourHeight = 64; // px por hora
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const todayDateStr = getLocalDateString();
  const isPast = date < todayDateStr;
  
  const effectiveSlots = useAvailabilityStore(state => state.getEffectiveSlots(date));
  
  const unavailableBlocks = useMemo(() => {
    const sorted = [...effectiveSlots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const unavailable: TimeSlot[] = [];
    let currentStart = 0;
    
    for (const slot of sorted) {
      const slotStart = timeToMinutes(slot.startTime);
      if (slotStart > currentStart) {
        unavailable.push({
          startTime: minutesToTime(currentStart),
          endTime: slot.startTime
        });
      }
      currentStart = Math.max(currentStart, timeToMinutes(slot.endTime));
    }
    
    if (currentStart < 24 * 60) {
      unavailable.push({
        startTime: minutesToTime(currentStart),
        endTime: '24:00'
      });
    }
    return unavailable;
  }, [effectiveSlots]);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isToday && gridRef.current) {
      const now = new Date();
      const scrollTo = Math.max(0, (now.getHours() - 1) * hourHeight);
      
      // Encontrar o container com scroll (o parent time-grid-container)
      const container = gridRef.current.closest('.time-grid-container');
      if (container) {
        container.scrollTop = scrollTo;
      }
    }
  }, [isToday, hourHeight]);
  
  return (
    <div className="time-grid" ref={gridRef}>
      {/* Linhas de hora */}
      {hours.map(hour => (
        <div 
          key={hour}
          className="time-grid__hour-line"
          style={{ top: hour * hourHeight }}
        />
      ))}
      
      {/* Blocos indisponíveis */}
      {unavailableBlocks.map((unav, i) => {
        const top = timeToPixels(unav.startTime, hourHeight);
        const duration = timeToMinutes(unav.endTime) - timeToMinutes(unav.startTime);
        const height = blockHeight(duration, hourHeight);
        
        return (
          <div
            key={`unav-${i}`}
            className="time-grid__unavailable"
            style={{ top, height }}
          />
        );
      })}
      
      {/* Blocos de tarefas */}
      {blocks.map(block => {
        const top = timeToPixels(block.startTime, hourHeight);
        const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
        const height = blockHeight(duration, hourHeight);
        
        return (
          <TaskBlock
            key={block.id}
            block={block}
            top={top}
            height={height}
            isPast={isPast}
          />
        );
      })}
      
      {/* Blocos de intervalo */}
      {breaks.map((brk, i) => {
        const top = timeToPixels(brk.startTime, hourHeight);
        const duration = timeToMinutes(brk.endTime) - timeToMinutes(brk.startTime);
        const height = blockHeight(duration, hourHeight);
        
        return (
          <BreakBlock
            key={i}
            breakData={brk}
            top={top}
            height={height}
          />
        );
      })}
      
      {/* Indicador de "agora" */}
      {isToday && <NowIndicator hourHeight={hourHeight} />}
    </div>
  );
}
