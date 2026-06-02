import { useState } from 'react';
import { Calendar as CalendarIcon, Edit2, Trash2 } from 'lucide-react';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import { ExceptionModal } from './ExceptionModal';
import { AvailabilityException } from '@/types/availability';
import { IconButton } from '../ui/IconButton';
import { timeToMinutes } from '@/utils/validation';

export function ExceptionsList() {
  const { exceptions, addException, removeException } = useAvailabilityStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingException, setEditingException] = useState<AvailabilityException | undefined>(undefined);

  const handleSave = async (exception: AvailabilityException) => {
    if (editingException) {
      await removeException(editingException.id);
      await addException(exception);
    } else {
      await addException(exception);
    }
    setIsModalOpen(false);
    setEditingException(undefined);
  };

  const handleEdit = (ex: AvailabilityException) => {
    setEditingException(ex);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remover esta exceção?')) {
      await removeException(id);
    }
  };

  return (
    <div className="exceptions-list" style={{ marginTop: 'var(--space-2xl)' }}>
      <header className="class-board__header" style={{ marginBottom: 'var(--space-lg)' }}>
        <h2>Exceções</h2>
        <p className="class-board__subtitle">Alterações de horário em dias específicos.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {exceptions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nenhuma exceção configurada.</p>
        ) : (
          exceptions.sort((a, b) => a.date.localeCompare(b.date)).map(ex => {
            let totalBlocks = 0;
            ex.slots.forEach(slot => {
              const dur = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
              if (dur > 0) totalBlocks += 1 + Math.floor((dur - 45) / 60);
            });

            return (
              <div key={ex.id} style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-md)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-xs)' }}>
                    <CalendarIcon size={16} color="var(--accent-base)" />
                    {new Date(ex.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
                    {ex.description && <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)' }}>- {ex.description}</span>}
                  </div>
                  {ex.isDayOff ? (
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>🏖️ Dia de folga</div>
                  ) : (
                    <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      {ex.slots.length} faixa(s) • {totalBlocks} blocos de 45min
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  <IconButton icon={<Edit2 size={16} />} onClick={() => handleEdit(ex)} />
                  <IconButton icon={<Trash2 size={16} />} onClick={() => handleDelete(ex.id)} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <button 
        className="class-board__add-btn"
        style={{ marginTop: 'var(--space-md)' }}
        onClick={() => { setEditingException(undefined); setIsModalOpen(true); }}
      >
        <CalendarIcon size={20} />
        Adicionar exceção
      </button>

      {isModalOpen && (
        <ExceptionModal
          onClose={() => { setIsModalOpen(false); setEditingException(undefined); }}
          onSave={handleSave}
          initialData={editingException}
        />
      )}
    </div>
  );
}
