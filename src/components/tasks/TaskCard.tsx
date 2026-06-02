import { Task } from '@/types/task';
import { useClassStore } from '@/stores/classStore';
import { useTaskStore } from '@/stores/taskStore';
import { ProgressBar } from './ProgressBar';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { classes } = useClassStore();
  const { tasks, updateTask } = useTaskStore();
  
  const taskClass = classes.find(c => c.id === task.classId);
  const color = taskClass?.color || 'var(--accent-base)';
  const className = taskClass?.name || 'Sem classe';
  
  const blocks = Math.max(1, Math.floor(task.totalDuration / 45));
  const completedBlocks = Math.floor(task.completedDuration / 45);
  const progress = blocks > 0 ? completedBlocks / blocks : 0;
  
  const hh = Math.floor(task.totalDuration / 60);
  const mm = task.totalDuration % 60;
  const durationStr = hh > 0 ? `${hh}h${mm > 0 ? mm : ''}` : `${mm}min`;
  
  const isComplete = task.status === 'completed';

  const dependencies = tasks.filter(t => task.dependsOn.includes(t.id));

  const handleToggleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComplete) {
      // Desfazer conclusão (vai apagar os blocos salvos como completed no DB e zerar o progresso)
      await useTaskStore.getState().uncompleteTask(task.id);
    } else {
      // Marcar como concluída (vai salvar os blocos atuais no DB como completed)
      await useTaskStore.getState().completeTask(task.id);
    }
  };

  return (
    <div 
      className={`task-card ${isComplete ? 'task-card--completed' : ''}`} 
      onClick={onClick}
    >
      <div 
        className={`task-card__checkbox ${isComplete ? 'task-card__checkbox--completed' : ''}`}
        onClick={handleToggleComplete}
      >
        {isComplete && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
      </div>
      
      <div className="task-card__content">
        <div className="task-card__name" style={{ textDecoration: isComplete ? 'line-through' : 'none', color: isComplete ? 'var(--text-muted)' : 'inherit' }}>
          {task.name}
        </div>
        
        <div className="task-card__meta">
          <span className="task-card__class-badge" style={{ color: 'white', backgroundColor: color }}>
            {className}
          </span>
          <span className="task-card__separator">·</span>
          <span>{task.isRecurring ? `🔄 ${durationStr} por repetição` : `⏱ ${durationStr}`}</span>
          
          {!task.isRecurring && (
            <>
              <span className="task-card__separator">·</span>
              <ProgressBar progress={progress} totalBlocks={blocks} />
            </>
          )}
        </div>
        
        {dependencies.length > 0 && (
          <div className="task-card__dependency">
            🔗 Depende de: {dependencies.map(d => d.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}
