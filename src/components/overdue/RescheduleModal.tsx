import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { addDays, format, parseISO } from 'date-fns';
import { Calendar, Clock, FastForward } from 'lucide-react';

interface RescheduleModalProps {
  taskName: string;
  currentDeadline: string; // YYYY-MM-DD
  onClose: () => void;
  onConfirm: (newDeadline: string) => void;
}

export function RescheduleModal({ taskName, currentDeadline, onClose, onConfirm }: RescheduleModalProps) {
  const [newDeadline, setNewDeadline] = useState<string>(currentDeadline);
  
  const handleQuickAdd = (days: number) => {
    const current = parseISO(newDeadline);
    const updated = addDays(current, days);
    setNewDeadline(format(updated, 'yyyy-MM-dd'));
  };

  const handleSave = () => {
    if (newDeadline) {
      onConfirm(newDeadline);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Adiar Deadline"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={!newDeadline || newDeadline <= currentDeadline}
          >
            Confirmar Nova Data
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <p>
          Reagendar a tarefa <strong>{taskName}</strong>. O deadline atual é {format(parseISO(currentDeadline), 'dd/MM/yyyy')}.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)' }}>
          <button 
            type="button" 
            onClick={() => handleQuickAdd(1)}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)',
              padding: 'var(--space-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer'
            }}
          >
            <Clock size={18} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>+1 dia</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleQuickAdd(3)}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)',
              padding: 'var(--space-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer'
            }}
          >
            <FastForward size={18} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>+3 dias</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleQuickAdd(7)}
            style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)',
              padding: 'var(--space-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer'
            }}
          >
            <Calendar size={18} />
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>+1 semana</span>
          </button>
        </div>
        
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <Input
            label="Ou selecione uma data específica"
            type="date"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
