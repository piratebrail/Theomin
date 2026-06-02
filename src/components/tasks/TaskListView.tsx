import { useState, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { TaskGroup } from './TaskGroup';
import { TaskForm } from './TaskForm';
import { Task } from '@/types/task';
import { RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export function TaskListView() {
  const { tasks, loadTasks, addTask, updateTask, loading } = useTaskStore();
  const toast = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Agrupar tarefas por deadline
  // Muito básico: vamos apenas ordenar e agrupar por string de data por enquanto.
  
  const groupedTasks: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    const key = task.deadline || 'Sem data';
    if (!groupedTasks[key]) groupedTasks[key] = [];
    groupedTasks[key].push(task);
  });
  
  const sortedDates = Object.keys(groupedTasks).sort(); // YYYY-MM-DD sorteia bonitinho
  
  const handleSave = async (task: Task) => {
    if (editingTask) {
      await updateTask(task.id, task);
      toast.success('Tarefa atualizada com sucesso');
    } else {
      await addTask(task);
      toast.success('Tarefa criada com sucesso');
    }
    setIsFormOpen(false);
    setEditingTask(undefined);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  if (loading) {
    return <div>Carregando tarefas...</div>;
  }

  return (
    <div className="task-list">
      <header className="task-list__header">
        <h1>Tarefas</h1>
        <button 
          className="button button--ghost" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} /> Recalcular
        </button>
      </header>

      <button 
        className="class-board__add-btn" 
        style={{ width: '100%', marginBottom: 'var(--space-md)' }}
        onClick={handleCreate}
      >
        <Plus size={20} /> Nova Tarefa
      </button>

      {sortedDates.map(date => {
        // Checar se é overdue ou urgent
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const taskDate = new Date(date + 'T00:00:00');
        
        const isOverdue = taskDate < now;
        const diffDays = Math.floor((taskDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = diffDays >= 0 && diffDays <= 1; // Hoje ou amanhã
        
        let label = `📅 Vence em ${taskDate.toLocaleDateString('pt-BR')}`;
        if (isOverdue) label = `⚠️ Atrasado (Venceu em ${taskDate.toLocaleDateString('pt-BR')})`;
        if (diffDays === 0) label = '📅 Vence Hoje';
        if (diffDays === 1) label = '📅 Vence Amanhã';

        return (
          <TaskGroup 
            key={date}
            dateLabel={label}
            isOverdue={isOverdue}
            isUrgent={isUrgent}
            tasks={groupedTasks[date].sort((a, b) => a.name.localeCompare(b.name))}
            onTaskClick={handleEdit}
          />
        );
      })}

      {isFormOpen && (
        <TaskForm 
          initialData={editingTask}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
