import { getLocalDateString } from '@/utils/date';
import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { DurationPicker } from './DurationPicker';
import { DependencyPicker } from './DependencyPicker';
import { RecurrenceConfigPanel } from './RecurrenceConfig';
import { FixedTimeConfigPanel } from './FixedTimeConfig';
import { useTaskStore } from '@/stores/taskStore';
import { useClassStore } from '@/stores/classStore';
import { Task, RecurrenceConfig, FixedTimeConfig } from '@/types/task';
import { nanoid } from 'nanoid';
import { useToast } from '@/components/ui/Toast';

interface TaskFormProps {
  initialData?: Task;
  onClose: () => void;
  onSave: (task: Task) => void;
}

export function TaskForm({ initialData, onClose, onSave }: TaskFormProps) {
  const { classes } = useClassStore();
  const { deleteTask } = useTaskStore();
  const toast = useToast();
  
  const defaultClass = [...classes].sort((a, b) => {
    if (a.priorityLevel !== b.priorityLevel) return a.priorityLevel - b.priorityLevel;
    return a.priorityPosition - b.priorityPosition;
  })[0];
  
  const [name, setName] = useState(initialData?.name || '');
  const [classId, setClassId] = useState(initialData?.classId || defaultClass?.id || '');
  const [totalDuration, setTotalDuration] = useState(initialData?.totalDuration || 45);
  
  const [startDate, setStartDate] = useState(initialData?.startDate || getLocalDateString());
  
  // Para deadline, padrão 7 dias após startDate
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 7);
  const [deadline, setDeadline] = useState(initialData?.deadline || getLocalDateString(defaultDeadline));
  
  const [dependsOn, setDependsOn] = useState<string[]>(initialData?.dependsOn || []);
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>(
    initialData?.recurrence || { type: 'weekly', daysOfWeek: [1, 2, 3, 4, 5] }
  );

  const [isFixedTime, setIsFixedTime] = useState(initialData?.isFixedTime || false);
  const [fixedTimeConfig, setFixedTimeConfig] = useState<FixedTimeConfig>(
    initialData?.fixedTime || { startTime: '12:00', daysOfWeek: [1, 2, 3, 4, 5] }
  );

  const handleSave = () => {
    if (!name || !classId || !startDate || !deadline) return;
    
    // TODO: validações extras de data (deadline >= startDate)
    
    const task: Task = {
      id: initialData?.id || nanoid(),
      name,
      classId,
      totalDuration,
      completedDuration: initialData?.completedDuration || 0,
      status: initialData?.status || 'pending',
      startDate,
      deadline,
      dependsOn,
      notes,
      isRecurring,
      recurrence: isRecurring ? recurrenceConfig : undefined,
      isFixedTime,
      fixedTime: isFixedTime ? fixedTimeConfig : undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    onSave(task);
  };

  const handleDelete = async () => {
    if (!initialData) return;
    
    // Check for dependent tasks
    const allTasks = useTaskStore.getState().tasks;
    const dependentTasks = allTasks.filter(t => t.dependsOn?.includes(initialData.id));
    
    let confirmMessage = 'Tem certeza que deseja excluir esta tarefa?';
    if (dependentTasks.length > 0) {
      const depNames = dependentTasks.map(t => `- ${t.name}`).join('\n');
      confirmMessage = `ATENÇÃO: As seguintes tarefas dependem desta e terão suas dependências removidas:\n${depNames}\n\nDeseja excluir mesmo assim?`;
    }

    if (window.confirm(confirmMessage)) {
      await deleteTask(initialData.id);
      toast.success('Tarefa excluída com sucesso');
      onClose();
    }
  };

  const classOptions = classes.map(c => ({
    label: c.name,
    value: c.id
  }));

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={initialData ? "Editar Tarefa" : "Nova Tarefa"}
      footer={
        <>
          {initialData && (
            <Button variant="ghost" onClick={handleDelete} style={{ color: 'var(--color-danger)' }}>
              Excluir
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!name || !classId}>
            {initialData ? "Salvar" : "Criar Tarefa"}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <Input
          label="Nome da tarefa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Estudar Cálculo III - Capítulo 5"
          autoFocus
        />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <Select
            label="Classe"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            options={classOptions}
          />
          <DurationPicker
            value={totalDuration}
            onChange={setTotalDuration}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <Input
            label="Data de início"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Prazo (deadline)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <DependencyPicker
          currentTaskId={initialData?.id}
          selectedIds={dependsOn}
          onChange={setDependsOn}
        />

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-xs)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)', minHeight: '80px', fontFamily: 'inherit',
              resize: 'none' as const
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-xl)', marginTop: 'var(--space-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <input 
              type="checkbox" 
              id="isRecurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="isRecurring" style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Tarefa Recorrente
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <input 
              type="checkbox" 
              id="isFixedTime"
              checked={isFixedTime}
              onChange={(e) => setIsFixedTime(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <label htmlFor="isFixedTime" style={{ fontSize: 'var(--text-md)', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Horário Fixo
            </label>
          </div>
        </div>

        {isRecurring && (
          <RecurrenceConfigPanel 
            value={recurrenceConfig} 
            onChange={setRecurrenceConfig} 
          />
        )}

        {isFixedTime && (
          <FixedTimeConfigPanel 
            value={fixedTimeConfig} 
            onChange={setFixedTimeConfig} 
          />
        )}
      </div>
    </Modal>
  );
}
