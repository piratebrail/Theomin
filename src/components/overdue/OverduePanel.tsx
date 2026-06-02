import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { OverdueCard } from './OverdueCard';
import { OverdueSummary } from './OverdueSummary';
import { AlertTriangle } from 'lucide-react';
import { TaskForm } from '../tasks/TaskForm';
import { Task } from '@/types/task';
import { useToast } from '@/components/ui/Toast';
import './OverduePanel.css';

export function OverduePanel() {
  const overdueEntries = useTaskStore(state => state.overdue);
  const tasks = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const toast = useToast();
  
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const handleSaveTask = async (task: Task) => {
    if (editingTaskId) {
      await updateTask(task.id, task);
      toast.success('Tarefa atualizada com sucesso');
    }
    setEditingTaskId(null);
  };
  
  const editingTask = tasks.find(t => t.id === editingTaskId);
  
  if (overdueEntries.length === 0) {
    return (
      <div className="overdue-panel">
        <div className="overdue-panel__header">
          <AlertTriangle size={32} style={{ color: 'var(--text-muted)' }} />
          <h1 style={{ color: 'var(--text-primary)' }}>Nenhuma tarefa atrasada!</h1>
        </div>
        <div className="overdue-panel__empty">
          Tudo em dia com a sua agenda. Parabéns! 🎉
        </div>
      </div>
    );
  }
  
  return (
    <div className="overdue-panel">
      <div className="overdue-panel__header">
        <AlertTriangle size={32} />
        <h1>Tarefas Atrasadas ({overdueEntries.length})</h1>
      </div>
      
      <div className="overdue-panel__list">
        {overdueEntries.map(entry => (
          <OverdueCard 
            key={entry.taskId} 
            entry={entry} 
            onClick={() => setEditingTaskId(entry.taskId)}
          />
        ))}
      </div>
      
      <OverdueSummary entries={overdueEntries} />
      
      {editingTaskId && editingTask && (
        <TaskForm
          initialData={editingTask}
          onClose={() => setEditingTaskId(null)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
}
