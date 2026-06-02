import { useMemo } from 'react';
import { Select } from '../ui/Select';
import { timeToMinutes, minutesToTime } from '@/utils/validation';

interface TimeInputProps {
  value: string;
  onChange: (time: string) => void;
  minTime?: string;
  isEnd?: boolean;
}

export function TimeInput({ value, onChange, minTime, isEnd }: TimeInputProps) {
  const options = useMemo(() => {
    const opts: { label: string, value: string }[] = [];
    
    if (isEnd && minTime) {
      const startMinutes = timeToMinutes(minTime);
      for (let blocks = 1; blocks <= 16; blocks++) {
        const duration = 45 + (blocks - 1) * 60;
        const endMinutes = startMinutes + duration;
        
        if (endMinutes > 24 * 60) break;
        
        const timeStr = minutesToTime(endMinutes);
        opts.push({ label: `${timeStr} (${blocks} blk)`, value: timeStr });
      }
    } else {
      // Start time: any 15 min interval
      for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
          const mStr = m.toString().padStart(2, '0');
          const hStr = h.toString().padStart(2, '0');
          const timeStr = `${hStr}:${mStr}`;
          
          if (!minTime || timeToMinutes(timeStr) >= timeToMinutes(minTime)) {
            opts.push({ label: timeStr, value: timeStr });
          }
        }
      }
    }
    return opts;
  }, [minTime, isEnd]);

  // Se o valor atual não está nas opções (ex: mudou o minTime), avisa/corrige silenciosamente ou permite
  // Aqui deixamos no select, o Select UI trata.

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      className="time-input"
    />
  );
}
