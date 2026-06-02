import { Plus } from 'lucide-react';
import type { TimeSlot } from '@/types/availability';
import { TimeSlotRow } from './TimeSlotRow';
import { timeToMinutes } from '@/utils/validation';

interface DayScheduleProps {
  dayName: string;
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
}

export function DaySchedule({ dayName, slots, onChange }: DayScheduleProps) {
  const handleAddSlot = () => {
    // Default slot (9:00 - 9:45)
    let newStart = '09:00';
    let newEnd = '09:45';
    
    // Se já existem slots, tenta colocar depois do último
    if (slots.length > 0) {
      const lastSlot = [...slots].sort((a, b) => timeToMinutes(b.endTime) - timeToMinutes(a.endTime))[0];
      const nextStartMin = timeToMinutes(lastSlot.endTime) + 15;
      if (nextStartMin + 45 <= 24 * 60) {
        const hh = Math.floor(nextStartMin / 60).toString().padStart(2, '0');
        const mm = (nextStartMin % 60).toString().padStart(2, '0');
        newStart = `${hh}:${mm}`;
        
        const endMin = nextStartMin + 45;
        const ehh = Math.floor(endMin / 60).toString().padStart(2, '0');
        const emm = (endMin % 60).toString().padStart(2, '0');
        newEnd = `${ehh}:${emm}`;
      }
    }
    
    onChange([...slots, { startTime: newStart, endTime: newEnd }]);
  };

  const handleUpdateSlot = (index: number, updatedSlot: TimeSlot) => {
    const newSlots = [...slots];
    newSlots[index] = updatedSlot;
    onChange(newSlots);
  };

  const handleRemoveSlot = (index: number) => {
    const newSlots = [...slots];
    newSlots.splice(index, 1);
    onChange(newSlots);
  };

  // Calcula total de horas e blocos
  let totalMinutes = 0;
  let totalBlocks = 0;
  
  slots.forEach(slot => {
    const dur = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    if (dur > 0) {
      totalMinutes += dur;
      totalBlocks += 1 + Math.floor((dur - 45) / 60);
    }
  });
  
  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const timeStr = hh > 0 ? `${hh}h${mm > 0 ? mm : ''}` : `${mm}min`;

  return (
    <div className="day-schedule">
      <div className="day-schedule__header">
        <h3 className="day-schedule__name">{dayName}</h3>
      </div>
      
      {slots.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
          Nenhum horário configurado
        </div>
      ) : (
        <div className="day-schedule__slots">
          {slots.map((slot, idx) => (
            <TimeSlotRow 
              key={idx}
              slot={slot}
              onChange={(s) => handleUpdateSlot(idx, s)}
              onRemove={() => handleRemoveSlot(idx)}
            />
          ))}
        </div>
      )}
      
      <button className="day-schedule__add" onClick={handleAddSlot}>
        <Plus size={16} /> Adicionar faixa horária
      </button>
      
      {slots.length > 0 && (
        <div className="day-schedule__summary" style={{ marginTop: 'var(--space-sm)' }}>
          Total: {timeStr} ({totalBlocks} bloco{totalBlocks !== 1 ? 's' : ''} de 45min)
        </div>
      )}
    </div>
  );
}
