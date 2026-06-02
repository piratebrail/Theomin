import { Task } from '@/types/task';
import { TaskCard } from './TaskCard';

interface TaskGroupProps {
  dateLabel: string;
  isUrgent?: boolean;
  isOverdue?: boolean;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function TaskGroup({ dateLabel, isUrgent, isOverdue, tasks, onTaskClick }: TaskGroupProps) {
  if (tasks.length === 0) return null;
  
  let labelClass = 'task-group__date';
  if (isOverdue) labelClass += ' task-group__date--overdue';
  else if (isUrgent) labelClass += ' task-group__date--urgent';

  return (
    <div className="task-group">
      <div className={labelClass}>{dateLabel}</div>
      <div className="task-group__list">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={() => onTaskClick(task)} 
          />
        ))}
      </div>
    </div>
  );
}
