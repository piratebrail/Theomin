import React from 'react';
import { Input } from '../ui/Input';
import { FixedTimeConfig } from '@/types/task';

interface FixedTimeConfigProps {
  value: FixedTimeConfig;
  onChange: (value: FixedTimeConfig) => void;
}

export function FixedTimeConfigPanel({ value, onChange }: FixedTimeConfigProps) {
  const handleDayToggle = (dayId: number) => {
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId];
    onChange({ ...value, daysOfWeek: newDays });
  };

  return (
    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <Input
          label="Horário de início"
          type="time"
          value={value.startTime}
          onChange={e => onChange({ ...value, startTime: e.target.value })}
        />
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Dias da semana
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
          {[{id: 1, lbl: 'Seg'}, {id: 2, lbl: 'Ter'}, {id: 3, lbl: 'Qua'}, {id: 4, lbl: 'Qui'}, {id: 5, lbl: 'Sex'}, {id: 6, lbl: 'Sáb'}, {id: 0, lbl: 'Dom'}].map(day => (
            <button
              key={day.id}
              onClick={() => handleDayToggle(day.id)}
              type="button"
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: (value.daysOfWeek || []).includes(day.id) ? 'var(--accent-base)' : 'var(--bg-elevated)',
                color: (value.daysOfWeek || []).includes(day.id) ? 'white' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)'
              }}
            >
              {day.lbl}
            </button>
          ))}
        </div>
      </div>
      
      <p style={{ marginTop: 'var(--space-sm)', fontSize: '12px', color: 'var(--color-warning)' }}>
        ⚠ Esta tarefa será agendada independentemente do seu tempo livre nos dias marcados.
      </p>
    </div>
  );
}
