import { useEffect } from 'react';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import { DayOfWeek } from '@/types/availability';
import { DaySchedule } from './DaySchedule';
import { ExceptionsList } from './ExceptionsList';
import { timeToMinutes } from '@/utils/validation';

const DAYS_MAP: Record<DayOfWeek, string> = {
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
  0: 'Domingo',
};

const DAYS_ORDER: DayOfWeek[] = [
  1, 2, 3, 4, 5, 6, 0
];

export function AvailabilityView() {
  const { weeklyPattern, loadAvailability, setDaySlots } = useAvailabilityStore();

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Calcula total semanal
  let totalBlocks = 0;
  let totalMinutes = 0;
  
  DAYS_ORDER.forEach(day => {
    const slots = weeklyPattern[day] || [];
    slots.forEach(slot => {
      const dur = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
      if (dur > 0) {
        totalMinutes += dur;
        totalBlocks += 1 + Math.floor((dur - 45) / 60);
      }
    });
  });

  const hh = Math.floor(totalMinutes / 60);
  const mm = totalMinutes % 60;
  const timeStr = hh > 0 ? `${hh}h${mm > 0 ? mm : ''}` : `${mm}min`;

  return (
    <div className="availability-view">
      <header className="class-board__header">
        <h1>Disponibilidade Semanal</h1>
        <p className="class-board__subtitle">
          Configure seus horários de trabalho padrão para cada dia da semana.
        </p>
      </header>

      <div className="availability-view__days">
        {DAYS_ORDER.map(day => (
          <DaySchedule
            key={day}
            dayName={DAYS_MAP[day]}
            slots={weeklyPattern[day] || []}
            onChange={(newSlots) => setDaySlots(day, newSlots)}
          />
        ))}
      </div>

      <div className="weekly-summary">
        <span className="weekly-summary__label">Resumo semanal:</span>
        <span className="weekly-summary__value">
          {timeStr} ({totalBlocks} blocos disponíveis)
        </span>
      </div>
      
      <ExceptionsList />
    </div>
  );
}
