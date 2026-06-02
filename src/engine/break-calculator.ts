import { ScheduledBlock } from '@/types/block';
import { timeToMinutes } from '@/utils/validation';

export interface BreakBlock {
  date: string;
  startTime: string;
  endTime: string;
  beforeBlockId: string;
  afterBlockId: string;
}

export function calculateBreaks(blocks: ScheduledBlock[]): BreakBlock[] {
  const breaks: BreakBlock[] = [];
  const sorted = [...blocks].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    
    // Breaks only exist between blocks on the same day
    if (current.date !== next.date) continue;
    
    // Verificar se há exatamente 15min entre os blocos
    const gapStart = current.endTime;
    const gapEnd = next.startTime;
    const gap = timeToMinutes(gapEnd) - timeToMinutes(gapStart);
    
    if (gap === 15) {
      breaks.push({
        date: current.date,
        startTime: gapStart,
        endTime: gapEnd,
        beforeBlockId: current.id,
        afterBlockId: next.id,
      });
    }
  }
  
  return breaks;
}
