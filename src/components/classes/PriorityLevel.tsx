import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskClass } from '@/types/class';
import { ClassCard } from './ClassCard';

interface PriorityLevelProps {
  level: number;
  classes: TaskClass[];
  onEdit: (cls: TaskClass) => void;
  onDelete: (id: string) => void;
}

export function PriorityLevel({ level, classes, onEdit, onDelete }: PriorityLevelProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `level-${level}`,
    data: {
      type: 'Level',
      level,
    }
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`priority-level ${isOver ? 'priority-level--drag-over' : ''}`}
    >
      <div className="priority-level__label">
        <span className="priority-level__number">Nível {level}</span>
        {level === 0 && <span className="priority-level__badge">Mais alta</span>}
      </div>
      
      <SortableContext 
        items={classes.map(c => c.id)} 
        strategy={horizontalListSortingStrategy}
      >
        <div className="priority-level__cards">
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              taskClass={cls}
              onEdit={() => onEdit(cls)}
              onDelete={() => onDelete(cls.id)}
            />
          ))}
          {classes.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', padding: 'var(--space-sm)' }}>
              Nível vazio
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
