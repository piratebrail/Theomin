import { X } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { TimeInput } from './TimeInput';
import { TimeSlot } from '@/types/availability';
import { timeToMinutes } from '@/utils/validation';

interface TimeSlotRowProps {
  slot: TimeSlot;
  onChange: (slot: TimeSlot) => void;
  onRemove: () => void;
  isOverlapping?: boolean;
}

export function TimeSlotRow({ slot, onChange, onRemove, isOverlapping }: TimeSlotRowProps) {
  // Ajusta o endTime se ele ficar inválido em relação ao novo startTime
  const handleStartChange = (newStart: string) => {
    const startMin = timeToMinutes(newStart);
    const endMin = timeToMinutes(slot.endTime);
    
    let newEnd = slot.endTime;
    if (endMin <= startMin + 45) {
      newEnd = '23:59'; // Vai precisar de lógica p/ achar o próximo válido
      // Aqui simplificamos: o usuário re-seleciona
    }
    
    onChange({ startTime: newStart, endTime: newEnd });
  };

  const handleEndChange = (newEnd: string) => {
    onChange({ ...slot, endTime: newEnd });
  };

  return (
    <div className={`time-slot-row ${isOverlapping ? 'time-slot-row--error' : ''}`}>
      <TimeInput 
        value={slot.startTime} 
        onChange={handleStartChange} 
      />
      <span className="time-slot-row__separator">até</span>
      <TimeInput 
        value={slot.endTime} 
        onChange={handleEndChange} 
        minTime={slot.startTime}
        isEnd 
      />
      <IconButton 
        icon={<X size={16} />} 
        onClick={onRemove} 
        className="time-slot-row__remove"
      />
    </div>
  );
}
