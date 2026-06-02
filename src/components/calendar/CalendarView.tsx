import { getLocalDateString } from '@/utils/date';
import { useEffect, useState, useMemo } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import { useClassStore } from '@/stores/classStore';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import { CalendarHeader } from './CalendarHeader';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { TimeGutter } from './TimeGutter';
import { runScheduler } from '@/engine/scheduler';
import { calculateBreaks } from '@/engine/break-calculator';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { timeToMinutes, minutesToTime } from '@/utils/validation';
import { ScheduledBlock } from '@/types/block';
import { Task } from '@/types/task';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useToast } from '@/components/ui/Toast';
import './CalendarView.css';

export function CalendarView() {
  const { viewType, editingTaskId, setEditingTaskId } = useCalendarStore();
  
  const tasks = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const classes = useClassStore(state => state.classes);
  const { weeklyPattern, exceptions } = useAvailabilityStore();
  const toast = useToast();
  
  // No mundo real, existingBlocks viriam de um blockStore, mas por enquanto vamos manter em state
  // ou no taskStore para simplificar. Vou colocar no taskStore em breve.
  const existingBlocks = useTaskStore(state => state.blocks || []);
  const setBlocks = useTaskStore(state => state.setBlocks);
  
  const [isRecalculating, setIsRecalculating] = useState(false);
  
  const handleRecalculate = async () => {
    setIsRecalculating(true);
    
    // Pequeno delay para a UI respirar (opcional)
    await new Promise(r => setTimeout(r, 50));
    
    try {
      const todayStr = getLocalDateString();
      const latestTasks = useTaskStore.getState().tasks;
      const latestBlocks = useTaskStore.getState().blocks;
      const latestClasses = useClassStore.getState().classes;
      const { weeklyPattern: latestWeekly, exceptions: latestExceptions } = useAvailabilityStore.getState();

      const result = runScheduler({
        tasks: latestTasks,
        classes: latestClasses,
        weeklyAvailability: latestWeekly,
        exceptions: latestExceptions,
        existingBlocks: latestBlocks,
        today: todayStr,
        isManualRecalc: true
      });
      
      const setOverdue = useTaskStore.getState().setOverdue;
      
      setBlocks(result.blocks);
      setOverdue(result.overdue);
    } catch (e) {
      console.error("Erro ao recalcular:", e);
      alert("Erro ao recalcular a agenda: " + (e as Error).message);
    } finally {
      setIsRecalculating(false);
    }
  };
  
  // Recálculo automático inicial
  useEffect(() => {
    if (existingBlocks.length === 0 && tasks.length > 0) {
      handleRecalculate();
    }
  }, [tasks.length]);
  
  const breaks = useMemo(() => calculateBreaks(existingBlocks), [existingBlocks]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over || !active) return;
    
    const block = active.data.current?.block as ScheduledBlock;
    const targetDate = over.id as string;
    
    if (!block || !targetDate) return;
    
    // Calcula mudança de tempo
    // 64px = 60min
    const deltaMinutes = (delta.y / 64) * 60;
    
    const originalMinutes = timeToMinutes(block.startTime);
    let newMinutes = originalMinutes + deltaMinutes;
    
    // Snap para 15 minutos
    newMinutes = Math.round(newMinutes / 15) * 15;
    
    // Bound para ficar dentro do dia
    const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
    newMinutes = Math.max(0, Math.min(newMinutes, 24 * 60 - duration));
    
    const newStartTime = minutesToTime(newMinutes);
    const newEndTime = minutesToTime(newMinutes + duration);
    
    await useTaskStore.getState().updateBlock(block.id, {
      date: targetDate,
      startTime: newStartTime,
      endTime: newEndTime,
      isManuallyPlaced: true
    });
  };
  
  const editingTask = tasks.find(t => t.id === editingTaskId);
  
  const handleSaveTask = async (task: Task) => {
    if (editingTaskId) {
      await updateTask(task.id, task);
      toast.success('Tarefa atualizada com sucesso');
    }
    setEditingTaskId(null);
  };
  
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="calendar-view">
      <CalendarHeader onRecalculate={handleRecalculate} />
      
      {isRecalculating && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Recalculando...
        </div>
      )}
      
      <div className="time-grid-container">
        <TimeGutter />
        
        {viewType === 'week' ? (
          <WeekView blocks={existingBlocks} breaks={breaks} />
        ) : (
          <DayView blocks={existingBlocks} breaks={breaks} />
        )}
      </div>
      
      {editingTaskId && editingTask && (
        <TaskForm
          initialData={editingTask}
          onClose={() => setEditingTaskId(null)}
          onSave={handleSaveTask}
        />
      )}
    </div>
    </DndContext>
  );
}
