import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2, Tag } from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { TaskClass } from '@/types/class';

interface ClassCardProps {
  taskClass: TaskClass;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClassCard({ taskClass, onEdit, onDelete }: ClassCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: taskClass.id,
    data: {
      type: 'Class',
      taskClass,
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    '--class-color': `var(--block-${taskClass.color})`,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      className="class-card"
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="class-card__color-bar" />
      <div className="class-card__content">
        <Tag size={18} />
        <span className="class-card__name">{taskClass.name}</span>
      </div>
      <div className="class-card__actions">
        <IconButton icon={<Pencil size={14} />} onClick={(e) => { e.stopPropagation(); onEdit(); }} />
        <IconButton icon={<Trash2 size={14} />} onClick={(e) => { e.stopPropagation(); onDelete(); }} />
      </div>
    </div>
  );
}
