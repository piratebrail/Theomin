import React from 'react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { RecurrenceConfig, RecurrenceType } from '@/types/task';

interface RecurrenceConfigProps {
  value: RecurrenceConfig;
  onChange: (value: RecurrenceConfig) => void;
}

export function RecurrenceConfigPanel({ value, onChange }: RecurrenceConfigProps) {
  const handleTypeChange = (type: RecurrenceType) => {
    let newValue = { ...value, type };
    if (type === 'weekly' || type === 'biweekly') {
      newValue.daysOfWeek = value.daysOfWeek || [1, 2, 3, 4, 5];
      delete newValue.dayOfMonth;
    } else if (type === 'monthly') {
      newValue.dayOfMonth = value.dayOfMonth || 1;
      delete newValue.daysOfWeek;
    } else {
      delete newValue.daysOfWeek;
      delete newValue.dayOfMonth;
    }
    onChange(newValue);
  };

  const handleDayToggle = (dayId: number) => {
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId];
    onChange({ ...value, daysOfWeek: newDays });
  };

  return (
    <div style={{ padding: 'var(--space-md)', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        <Select
          label="Frequência"
          value={value.type}
          onChange={e => handleTypeChange(e.target.value as RecurrenceType)}
          options={[
            { value: 'daily', label: 'Diariamente' },
            { value: 'weekly', label: 'Semanalmente' },
            { value: 'biweekly', label: 'Quinzenalmente' },
            { value: 'monthly', label: 'Mensalmente' },
          ]}
        />
        <Input
          label="Data de fim (opcional)"
          type="date"
          value={value.endDate || ''}
          onChange={e => onChange({ ...value, endDate: e.target.value || null })}
        />
      </div>

      {(value.type === 'weekly' || value.type === 'biweekly') && (
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
      )}

      {value.type === 'monthly' && (
        <div>
           <Input
            label="Dia do mês"
            type="number"
            min={1}
            max={31}
            value={value.dayOfMonth || 1}
            onChange={e => onChange({ ...value, dayOfMonth: parseInt(e.target.value) || 1 })}
          />
        </div>
      )}
      
      <p style={{ marginTop: 'var(--space-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
        A duração total definida acima será aplicada a <strong>cada repetição</strong> do hábito.
      </p>
    </div>
  );
}
