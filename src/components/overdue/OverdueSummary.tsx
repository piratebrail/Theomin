import { OverdueEntry } from '@/engine/scheduler';
import { useAvailabilityStore } from '@/stores/availabilityStore';

interface OverdueSummaryProps {
  entries: OverdueEntry[];
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}min`;
}

export function OverdueSummary({ entries }: OverdueSummaryProps) {
  const weeklyPattern = useAvailabilityStore(state => state.weeklyPattern);
  
  const totalMinutes = entries.reduce((sum, e) => sum + e.remainingDuration, 0);
  const totalBlocks = Math.ceil(totalMinutes / 45);
  const durationLabel = formatDuration(totalMinutes);
  
  // Calcular dias para desafogar com base na disponibilidade média
  // Simplificação: soma total de minutos da semana / 7
  let totalWeeklyMinutes = 0;
  Object.values(weeklyPattern).forEach(daySlots => {
    daySlots.forEach((slot: any) => {
      const start = slot.startTime.split(':').map(Number);
      const end = slot.endTime.split(':').map(Number);
      const diff = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
      totalWeeklyMinutes += Math.max(0, diff);
    });
  });
  
  const avgDailyMinutes = totalWeeklyMinutes / 7;
  const avgDailyBlocks = avgDailyMinutes > 0 ? (avgDailyMinutes / 45) : 0;
  const daysToRecover = avgDailyBlocks > 0 ? Math.ceil(totalBlocks / avgDailyBlocks) : 0;
  
  return (
    <div className="overdue-summary">
      <div className="overdue-summary__stat">
        <span className="overdue-summary__label">
          Tempo total de trabalho para desafogar:
        </span>
        <span className="overdue-summary__value">
          {durationLabel} (≈ {totalBlocks} blocos)
        </span>
      </div>
      
      <div className="overdue-summary__estimate">
        Estimativa: com sua disponibilidade atual, você desafogaria em ~{daysToRecover} dia{daysToRecover > 1 ? 's' : ''} {daysToRecover === 1 ? 'útil' : 'úteis'}.
      </div>
    </div>
  );
}
