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
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const groupedPending: Record<string, Task[]> = {};
  
  pendingTasks.forEach(task => {
    const key = task.deadline || 'Sem data';
    if (!groupedPending[key]) groupedPending[key] = [];
    groupedPending[key].push(task);
  });
  
  const sortedPendingDates = Object.keys(groupedPending).sort(); // YYYY-MM-DD sorteia bonitinho

  const sortedCompleted = [...completedTasks].sort((a, b) => {
    const dateA = a.deadline || '0000-00-00';
    const dateB = b.deadline || '0000-00-00';
    return dateB.localeCompare(dateA); // Ordem decrescente (vence primeiro vai pro final)
  });
  
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

      {sortedPendingDates.map(date => {
        // Checar se é overdue ou urgent
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const taskDate = new Date(date + 'T00:00:00');
        
        const isOverdue = taskDate < now;
        const diffDays = Math.floor((taskDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isUrgent = diffDays >= 0 && diffDays <= 1; // Hoje ou amanhã
        
        let label = `📅 Vence em ${taskDate.toLocaleDateString('pt-BR')}`;
        if (isOverdue) label = `⚠️ ATRASADO (VENCEU EM ${taskDate.toLocaleDateString('pt-BR')})`;
        else if (diffDays === 0) label = '📅 VENCE HOJE';
        else if (diffDays === 1) label = '📅 VENCE AMANHÃ';
        else if (date === 'Sem data') label = '📦 SEM DATA';

        return (
          <TaskGroup 
            key={date}
            dateLabel={label}
            isOverdue={isOverdue && date !== 'Sem data'}
            isUrgent={isUrgent && date !== 'Sem data'}
            tasks={groupedPending[date].sort((a, b) => a.name.localeCompare(b.name))}
            onTaskClick={handleEdit}
          />
        );
      })}

      {sortedCompleted.length > 0 && (
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <TaskGroup 
            dateLabel="✅ CONCLUÍDAS"
            isOverdue={false}
            isUrgent={false}
            tasks={sortedCompleted}
            onTaskClick={handleEdit}
          />
        </div>
      )}

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
