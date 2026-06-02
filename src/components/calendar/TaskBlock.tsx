import { useTaskStore } from '@/stores/taskStore';
import { useClassStore } from '@/stores/classStore';
import { ScheduledBlock } from '@/types/block';
import { Check, RotateCcw } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCalendarStore } from '@/stores/calendarStore';

interface TaskBlockProps {
  block: ScheduledBlock;
  top: number;
  height: number;
  isPast?: boolean;
}

export function TaskBlock({ block, top, height, isPast = false }: TaskBlockProps) {
  const task = useTaskStore(state => state.tasks.find(t => t.id === block.taskId));
  const taskClass = useClassStore(state => state.classes.find(c => c.id === task?.classId));
  const completeBlock = useTaskStore(state => state.completeBlock);
  const uncompleteBlock = useTaskStore(state => state.uncompleteBlock);
  const setEditingTaskId = useCalendarStore(state => state.setEditingTaskId);
  
  if (!task) return null;

  const isCompleted = block.status === 'completed';
  const totalBlocks = Math.ceil(task.totalDuration / 45);
  
  const isDraggable = !isCompleted && !isPast;
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
    data: { type: 'block', block },
    disabled: !isDraggable,
  });
  
  const style: React.CSSProperties = {
    top: `${top}px`,
    height: `${height}px`,
    left: '4px',
    right: '4px',
    '--block-color': `var(--block-${taskClass?.color || 'purple'})`,
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: transform ? 100 : undefined,
  } as React.CSSProperties;
  
  return (
    <div 
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`task-block ${isCompleted ? 'task-block--completed' : ''}`}
      style={style}
      onClick={() => setEditingTaskId(task.id)}
    >
      <div className="task-block__color-stripe" />
      <div className="task-block__content">
        <span className="task-block__name">{task.name}</span>
        {height >= 40 && (
          <span className="task-block__meta">
            {taskClass?.name} · Bloco {block.order + 1}/{totalBlocks}
          </span>
        )}
      </div>
      
      {!isCompleted && !isPast && (
        <button 
          className="task-block__complete"
          onClick={(e) => { 
            e.stopPropagation(); 
            completeBlock(block.id); 
          }}
          title="Marcar como concluído"
        >
          <Check size={14} />
        </button>
      )}

      {isCompleted && (
        <button 
          className="task-block__complete"
          onClick={(e) => { 
            e.stopPropagation(); 
            uncompleteBlock(block.id); 
          }}
          title="Desfazer conclusão"
        >
          <RotateCcw size={14} />
        </button>
      )}
      
      {task.isFixedTime && (
        <span className="task-block__pin" title="Horário fixo">📌</span>
      )}
    </div>
  );
}
