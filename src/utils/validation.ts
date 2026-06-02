// src/utils/validation.ts
import { TimeSlot } from '@/types/availability';
import { Task, TaskId } from '@/types/task';

// Converte 'HH:mm' para minutos (ex: '09:00' -> 540)
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Converte minutos para 'HH:mm'
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function addMinutesToTime(timeStr: string, addMin: number): string {
  const current = timeToMinutes(timeStr);
  return minutesToTime(current + addMin);
}

/** Duração deve ser múltiplo de 45 minutos */
export function isValidDuration(minutes: number): boolean {
  return minutes > 0 && minutes % 45 === 0;
}

/** Opções de duração disponíveis: 45, 90, 135, 180, 225, 270... */
export function getDurationOptions(maxMinutes = 720): { label: string; value: number }[] {
  const options = [];
  for (let m = 45; m <= maxMinutes; m += 45) {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const label = hours > 0 
      ? mins > 0 ? `${hours}h${mins}` : `${hours}h`
      : `${mins}min`;
    options.push({ label, value: m });
  }
  return options;
}

/** Valida que um TimeSlot respeita os múltiplos */
export function isValidTimeSlot(slot: TimeSlot): boolean {
  const startMinutes = timeToMinutes(slot.startTime);
  const endMinutes = timeToMinutes(slot.endTime);
  const duration = endMinutes - startMinutes;
  
  if (duration < 45) return false;
  
  const remaining = duration - 45;
  if (remaining === 0) return true;
  return remaining % 60 === 0;
}

/** Deadline deve ser posterior à data de início */
export function isValidDeadline(startDate: string, deadline: string): boolean {
  return new Date(deadline) >= new Date(startDate); // alterado para >= para permitir mesma data
}

/** Verificação de dependências circulares */
export function hasCircularDependency(
  taskId: TaskId, 
  dependsOn: TaskId[], 
  allTasks: Task[]
): boolean {
  const visited = new Set<TaskId>();
  
  function dfs(currentId: TaskId): boolean {
    if (currentId === taskId) return true;
    if (visited.has(currentId)) return false;
    visited.add(currentId);
    
    const task = allTasks.find(t => t.id === currentId);
    if (!task) return false;
    
    return task.dependsOn.some(depId => dfs(depId));
  }
  
  return dependsOn.some(depId => dfs(depId));
}
