import { useTaskStore } from '@/stores/taskStore';
import { useClassStore } from '@/stores/classStore';
import { OverdueEntry } from '@/engine/scheduler';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface OverdueCardProps {
  entry: OverdueEntry;
  onClick?: () => void;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}min`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function OverdueCard({ entry, onClick }: OverdueCardProps) {
  const task = useTaskStore(state => state.tasks.find(t => t.id === entry.taskId));
  const taskClass = useClassStore(state => state.classes.find(c => c.id === task?.classId));
  const allBlocks = useTaskStore(state => state.blocks);
  const allTasks = useTaskStore(state => state.tasks);
  
  const scheduledBlocks = allBlocks.filter(b => b.taskId === entry.taskId && b.status === 'scheduled');
  const dependentTasks = allTasks.filter(t => t.dependsOn.includes(entry.taskId) && t.status !== 'completed');
  
  const updateTask = useTaskStore(state => state.updateTask);
  const toast = useToast();
  
  if (!task) return null;
  
  const severity = entry.daysOverdue >= 3 ? 'critical' 
    : entry.daysOverdue >= 1 ? 'warning' 
    : 'mild';
  
  const blocksRemaining = Math.ceil(entry.remainingDuration / 45);
  const durationLabel = formatDuration(entry.remainingDuration);
  const isPartial = scheduledBlocks.length > 0;
  
  const handleComplete = () => {
    updateTask(task.id, { 
      status: 'completed',
      completedDuration: task.totalDuration 
    });
    toast.success(`Tarefa "${task.name}" concluída!`);
  };
  
  return (
    <div className={`overdue-card overdue-card--${severity}`}>
      <div className="overdue-card__severity-indicator" />
      
      <button 
        className="overdue-card__checkbox"
        onClick={handleComplete}
        title="Marcar como concluído"
      >
        <Check size={16} />
      </button>
      
      <div 
        className="overdue-card__content"
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className="overdue-card__grid">
          <div className="overdue-card__title-cell">
            <h3 className="overdue-card__name">{task.name}</h3>
            <div className="overdue-card__class">
              <span 
                className="overdue-card__class-dot" 
                style={{ background: `var(--color-${taskClass?.color || 'accent'})` }} 
              />
              {taskClass?.name}
            </div>
          </div>
          
          <div className="overdue-card__deadline-cell">
            <span className="overdue-card__cell-label">Deadline</span>
            <span className="overdue-card__cell-value" style={{ color: entry.daysOverdue > 0 ? 'var(--color-danger)' : 'var(--color-warning)' }}>
              {formatDate(entry.originalDeadline)}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
              {entry.daysOverdue > 0 
                ? `${entry.daysOverdue} dia${entry.daysOverdue > 1 ? 's' : ''} atrasada`
                : (() => {
                    const d1 = new Date();
                    d1.setHours(0, 0, 0, 0);
                    const d2 = new Date(entry.originalDeadline + 'T00:00:00');
                    const diff = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                    if (diff === 0) return 'Vence hoje';
                    if (diff === 1) return 'Vence amanhã';
                    return `Em ${diff} dias`;
                  })()
              }
            </span>
          </div>

          <div className="overdue-card__time-cell">
            <span className="overdue-card__cell-label">Falta</span>
            <span className="overdue-card__cell-value">
              {durationLabel}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
              {blocksRemaining} bloco{blocksRemaining > 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {isPartial && (
          <div className="overdue-card__partial-notice">
            ⚠️ Overflow parcial — {scheduledBlocks.length * 45}min no calendário
          </div>
        )}
        
        {dependentTasks.length > 0 && (
          <div className="overdue-card__dependency-notice">
            ⚡ Bloqueando: {dependentTasks.map(t => `"${t.name}"`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
