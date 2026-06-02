import { getLocalDateString } from '@/utils/date';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { TimeSlotRow } from './TimeSlotRow';
import { TimeSlot, AvailabilityException } from '@/types/availability';
import { nanoid } from 'nanoid';
import { timeToMinutes } from '@/utils/validation';
import { Plus } from 'lucide-react';

interface ExceptionModalProps {
  onClose: () => void;
  onSave: (exception: AvailabilityException) => void;
  initialData?: AvailabilityException;
}

export function ExceptionModal({ onClose, onSave, initialData }: ExceptionModalProps) {
  const [date, setDate] = useState(initialData?.date || getLocalDateString());
  const [description, setDescription] = useState(initialData?.description || '');
  const [isDayOff, setIsDayOff] = useState(initialData?.isDayOff || false);
  const [slots, setSlots] = useState<TimeSlot[]>(initialData?.slots || []);

  const handleAddSlot = () => {
    let newStart = '09:00';
    let newEnd = '09:45';
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
    setSlots([...slots, { startTime: newStart, endTime: newEnd }]);
  };

  const handleSave = () => {
    onSave({
      id: initialData?.id || nanoid(),
      date,
      description,
      isDayOff,
      slots: isDayOff ? [] : slots,
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={initialData ? "Editar Exceção" : "Nova Exceção de Disponibilidade"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!date}>Salvar Exceção</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <Input
          type="date"
          label="Data"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        
        <Input
          type="text"
          label="Descrição (ex: Feriado Nacional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
        />
        
        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={isDayOff} 
            onChange={(e) => setIsDayOff(e.target.checked)} 
          />
          Dia de folga (sem disponibilidade)
        </label>

        {!isDayOff && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
              Faixas horárias para este dia:
            </h4>
            {slots.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Nenhuma faixa. Será considerado dia de folga.</p>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              {slots.map((slot, idx) => (
                <TimeSlotRow
                  key={idx}
                  slot={slot}
                  onChange={(s) => {
                    const newSlots = [...slots];
                    newSlots[idx] = s;
                    setSlots(newSlots);
                  }}
                  onRemove={() => {
                    const newSlots = [...slots];
                    newSlots.splice(idx, 1);
                    setSlots(newSlots);
                  }}
                />
              ))}
            </div>

            <button 
              onClick={handleAddSlot}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
                color: 'var(--accent-base)', background: 'transparent', border: 'none',
                cursor: 'pointer', marginTop: 'var(--space-md)', fontSize: 'var(--text-sm)'
              }}
            >
              <Plus size={16} /> Adicionar faixa
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
