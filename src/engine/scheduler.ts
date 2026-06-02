import { getLocalDateString } from '@/utils/date';
import { Task, TaskId } from '@/types/task';
import { TaskClass } from '@/types/class';
import { ScheduledBlock } from '@/types/block';
import { WeeklyAvailability, AvailabilityException, TimeSlot } from '@/types/availability';
import { timeToMinutes, minutesToTime, addMinutesToTime } from '@/utils/validation';
import { topologicalSort } from './dependency-resolver';
import { nanoid } from 'nanoid';

// --- Types ---
export interface SchedulerInput {
  tasks: Task[];
  classes: TaskClass[];
  weeklyAvailability: WeeklyAvailability;
  exceptions: AvailabilityException[];
  existingBlocks: ScheduledBlock[];
  today: string; // YYYY-MM-DD
  isManualRecalc: boolean;
}

export interface OverdueEntry {
  taskId: TaskId;
  remainingDuration: number;
  daysOverdue: number;
  originalDeadline: string;
}

export interface SchedulerWarning {
  taskId: TaskId;
  type: 'tight_deadline' | 'dependency_delay' | 'partial_overflow';
  message: string;
}

export interface SchedulerOutput {
  blocks: ScheduledBlock[];
  overdue: OverdueEntry[];
  warnings: SchedulerWarning[];
}

export interface DaySlots {
  date: string;
  slots: TimeSlot[];
  availableMinutes: number;
  blockCapacity: number;
}

// --- Helper Functions ---
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

function formatDate(date: Date): string {
  return getLocalDateString(date);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function differenceInDays(d1: Date, d2: Date): number {
  return Math.floor((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

function isDescendant(taskId: string, ancestorId: string, tasks: Task[]): boolean {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return false;
  if (task.dependsOn.includes(ancestorId)) return true;
  for (const depId of task.dependsOn) {
    if (isDescendant(depId, ancestorId, tasks)) return true;
  }
  return false;
}

// --- Fase 1: Preparação ---
function generateSlotMap(
  startDate: string,
  endDate: string,
  weekly: WeeklyAvailability,
  exceptions: AvailabilityException[]
): Map<string, DaySlots> {
  const map = new Map<string, DaySlots>();
  let current = parseDate(startDate);
  const end = parseDate(endDate);
  
  while (current <= end) {
    const dateStr = formatDate(current);
    const dayOfWeek = current.getDay();
    
    const exception = exceptions.find(e => e.date === dateStr);
    let slots: TimeSlot[];
    
    if (exception) {
      slots = exception.isDayOff ? [] : [...exception.slots]; // Clonar slots
    } else {
      slots = (weekly[dayOfWeek as keyof WeeklyAvailability] || []).map(s => ({...s})); // Clonar
    }
    
    const totalMinutes = slots.reduce((sum, s) => 
      sum + (timeToMinutes(s.endTime) - timeToMinutes(s.startTime)), 0
    );
    
    const blockCapacity = slots.reduce((sum, s) => {
      const duration = timeToMinutes(s.endTime) - timeToMinutes(s.startTime);
      return sum + (duration >= 45 ? 1 + Math.floor((duration - 45) / 60) : 0);
    }, 0);
    
    map.set(dateStr, { date: dateStr, slots, availableMinutes: totalMinutes, blockCapacity });
    current = addDays(current, 1);
  }
  
  return map;
}

function subtractFromSlotMap(slotMap: Map<string, DaySlots>, dateStr: string, startTime: string, endTime: string) {
  const daySlots = slotMap.get(dateStr);
  if (!daySlots) return;
  
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  
  const newSlots: TimeSlot[] = [];
  
  for (const slot of daySlots.slots) {
    const sMin = timeToMinutes(slot.startTime);
    const eMin = timeToMinutes(slot.endTime);
    
    if (endMin <= sMin || startMin >= eMin) {
      // Não sobrepõe
      newSlots.push(slot);
    } else {
      // Sobrepõe
      if (sMin < startMin) {
        newSlots.push({ startTime: slot.startTime, endTime: minutesToTime(startMin) });
      }
      if (endMin < eMin) {
        newSlots.push({ startTime: minutesToTime(endMin), endTime: slot.endTime });
      }
    }
  }
  
  daySlots.slots = newSlots;
}

// --- Fase 2: Fixos ---
function phase2_placeFixed(
  slotMap: Map<string, DaySlots>,
  fixedTasks: Task[],
  completedBlocks: ScheduledBlock[],
  manualBlocks: ScheduledBlock[]
): { placed: ScheduledBlock[], updatedSlotMap: Map<string, DaySlots> } {
  const placed: ScheduledBlock[] = [];
  
  for (const block of completedBlocks) {
    placed.push(block);
    subtractFromSlotMap(slotMap, block.date, block.startTime, block.endTime);
  }
  
  for (const block of manualBlocks) {
    placed.push(block);
    subtractFromSlotMap(slotMap, block.date, block.startTime, block.endTime);
  }
  
  for (const task of fixedTasks) {
    if (!task.isFixedTime || !task.fixedTime) continue;
    
    const { startTime, daysOfWeek } = task.fixedTime;
    const blocksNeeded = Math.ceil(task.totalDuration / 45); // simplificado
    
    for (const [dateStr] of slotMap) {
      const dayOfWeek = parseDate(dateStr).getDay();
      if (!daysOfWeek.includes(dayOfWeek)) continue;
      if (dateStr < task.startDate) continue;
      
      let currentTime = startTime;
      for (let i = 0; i < blocksNeeded; i++) {
        const endTime = addMinutesToTime(currentTime, 45);
        
        placed.push({
          id: nanoid(),
          taskId: task.id,
          date: dateStr,
          startTime: currentTime,
          endTime: endTime,
          status: 'scheduled',
          isManuallyPlaced: false,
          order: i,
        });
        
        subtractFromSlotMap(slotMap, dateStr, currentTime, endTime);
        currentTime = addMinutesToTime(currentTime, 60);
      }
    }
  }
  
  return { placed, updatedSlotMap: slotMap };
}

// --- Fase 3: Prioridade ---
function phase3_prioritize(
  tasks: Task[],
  classes: TaskClass[],
  taskRemaining: Map<TaskId, number>,
  slotMap: Map<string, DaySlots>,
  dependencyOrder: TaskId[],
  today: string
): Task[] {
  const classPriority = new Map<string, number>();
  for (const cls of classes) {
    classPriority.set(cls.id, cls.priorityLevel * 100 + cls.priorityPosition);
  }
  
  const taskUrgency = new Map<TaskId, number>();
  
  for (const task of tasks) {
    if (task.isFixedTime) continue;
    
    const remaining = taskRemaining.get(task.id) || 0;
    const blocksNeeded = Math.ceil(remaining / 45);
    
    const effectiveDeadline = addDays(parseDate(task.deadline), -1);
    let blocksAvailable = 0;
    
    for (const [dateStr, daySlots] of slotMap) {
      if (dateStr < today) continue;
      if (dateStr > formatDate(effectiveDeadline)) break;
      if (dateStr < task.startDate) continue;
      blocksAvailable += daySlots.blockCapacity;
    }
    
    const urgency = blocksAvailable > 0 ? blocksNeeded / blocksAvailable : Infinity;
    taskUrgency.set(task.id, urgency);
  }
  
  const sorted = [...tasks]
    .filter(t => !t.isFixedTime)
    .sort((a, b) => {
      const urgA = taskUrgency.get(a.id) || 0;
      const urgB = taskUrgency.get(b.id) || 0;
      
      const urgentA = urgA > 0.7;
      const urgentB = urgB > 0.7;
      
      if (urgentA && !urgentB) return -1;
      if (urgentB && !urgentA) return 1;
      if (urgentA && urgentB) return urgB - urgA;
      
      if (isDescendant(a.id, b.id, tasks)) return 1; // b vem primeiro se a depende de b
      if (isDescendant(b.id, a.id, tasks)) return -1; // a vem primeiro se b depende de a
      
      const deadlineCmp = a.deadline.localeCompare(b.deadline);
      if (deadlineCmp !== 0) return deadlineCmp;
      
      const prioA = classPriority.get(a.classId) || 999;
      const prioB = classPriority.get(b.classId) || 999;
      
      return prioA - prioB;
    });
  
  return sorted;
}

// --- Fase 4: Alocação Greedy ---
function findFreeSpaces(slot: TimeSlot, existingBlocks: ScheduledBlock[]): TimeSlot[] {
  const spaces: TimeSlot[] = [];
  let currentTime = timeToMinutes(slot.startTime);
  const endTime = timeToMinutes(slot.endTime);
  
  for (const block of existingBlocks) {
    const bStart = timeToMinutes(block.startTime);
    const bEnd = timeToMinutes(block.endTime);
    
    if (bEnd <= currentTime) continue;
    if (bStart >= endTime) break;
    
    if (bStart > currentTime) {
      spaces.push({ startTime: minutesToTime(currentTime), endTime: minutesToTime(bStart) });
    }
    currentTime = Math.max(currentTime, bEnd);
  }
  
  if (currentTime < endTime) {
    spaces.push({ startTime: minutesToTime(currentTime), endTime: minutesToTime(endTime) });
  }
  
  return spaces;
}

function getLastBlockBefore(timeStr: string, date: string, blocks: ScheduledBlock[]): ScheduledBlock | undefined {
  const timeMin = timeToMinutes(timeStr);
  let best: ScheduledBlock | undefined;
  let bestTime = -1;
  
  for (const b of blocks) {
    if (b.date === date) {
      const eMin = timeToMinutes(b.endTime);
      if (eMin <= timeMin && eMin > bestTime) {
        bestTime = eMin;
        best = b;
      }
    }
  }
  return best;
}

function allocateBlocksInDay(
  taskId: TaskId,
  daySlots: DaySlots,
  maxBlocks: number,
  date: string,
  existingBlocks: ScheduledBlock[],
  startingOrder: number
): ScheduledBlock[] {
  const newBlocks: ScheduledBlock[] = [];
  let blocksPlaced = 0;
  
  const dayExistingBlocks = existingBlocks
    .filter(b => b.date === date)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    
  for (const slot of daySlots.slots) {
    if (blocksPlaced >= maxBlocks) break;
    
    const freeSpaces = findFreeSpaces(slot, dayExistingBlocks);
    
    for (const space of freeSpaces) {
      if (blocksPlaced >= maxBlocks) break;
      
      let currentTime = space.startTime;
      
      while (blocksPlaced < maxBlocks) {
        let endTime = addMinutesToTime(currentTime, 45);
        
        if (timeToMinutes(endTime) > timeToMinutes(space.endTime)) break;
        
        const prevBlock = getLastBlockBefore(currentTime, date, [...existingBlocks, ...newBlocks]);
        if (prevBlock) {
          const withBreak = addMinutesToTime(prevBlock.endTime, 15);
          if (timeToMinutes(withBreak) > timeToMinutes(currentTime)) {
            currentTime = withBreak;
            endTime = addMinutesToTime(currentTime, 45);
            if (timeToMinutes(endTime) > timeToMinutes(space.endTime)) break;
          }
        }
        
        newBlocks.push({
          id: nanoid(),
          taskId,
          date,
          startTime: currentTime,
          endTime: endTime,
          status: 'scheduled',
          isManuallyPlaced: false,
          order: startingOrder + blocksPlaced,
        });
        
        blocksPlaced++;
        currentTime = addMinutesToTime(currentTime, 60);
      }
    }
  }
  
  return newBlocks;
}

// --- Main Engine ---
export function runScheduler(input: SchedulerInput): SchedulerOutput {
  const horizon = 90;
  const endDate = formatDate(addDays(parseDate(input.today), horizon));
  
  // Fase 1: Preparação
  const slotMap = generateSlotMap(input.today, endDate, input.weeklyAvailability, input.exceptions);
  const activeTasks = input.tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  
  const taskRemaining = new Map<TaskId, number>();
  for (const task of activeTasks) {
    taskRemaining.set(task.id, task.totalDuration - task.completedDuration);
  }
  
  const completedBlocks = input.existingBlocks.filter(b => b.status === 'completed');
  const manualBlocks = input.isManualRecalc 
    ? [] 
    : input.existingBlocks.filter(b => b.isManuallyPlaced && b.status === 'scheduled');
    
  const dependencyOrder = topologicalSort(activeTasks);
  
  // Fase 2: Fixos
  const fixedTasks = activeTasks.filter(t => t.isFixedTime);
  const { placed: fixedPlaced, updatedSlotMap } = phase2_placeFixed(slotMap, fixedTasks, completedBlocks, manualBlocks);
  const allocatedBlocks: ScheduledBlock[] = [...fixedPlaced];
  
  // Fase 3: Prioridade
  const sortedTasks = phase3_prioritize(activeTasks, input.classes, taskRemaining, updatedSlotMap, dependencyOrder, input.today);
  
  // Fase 4: Alocação Greedy
  const overflowTasks = new Map<TaskId, number>();
  const dependencyCompletionDates = new Map<TaskId, string>();
  
  for (const task of sortedTasks) {
    const isHabit = task.isRecurring && task.recurrence;
    const remaining = taskRemaining.get(task.id) || 0;
    
    if (!isHabit && remaining <= 0) continue;
    
    let blocksToAllocate = Math.ceil(remaining / 45); // Para tasks normais (orçamento global)
    const blocksPerRepetition = Math.ceil(task.totalDuration / 45); // Para hábitos (orçamento por dia)
    
    let effectiveStart = task.startDate;
    
    for (const depId of task.dependsOn) {
      const depEnd = dependencyCompletionDates.get(depId);
      if (depEnd && depEnd > effectiveStart) {
        effectiveStart = depEnd;
      }
    }
    
    if (effectiveStart < input.today) effectiveStart = input.today;
    
    const effectiveDeadline = isHabit 
      ? (task.recurrence!.endDate ? task.recurrence!.endDate : endDate) // Hábitos vão até o fim
      : formatDate(addDays(parseDate(task.deadline), -1));
      
    let blocksAllocated = 0;
    let lastAllocatedDate = effectiveStart;
    
    for (const [dateStr, daySlots] of updatedSlotMap) {
      if (dateStr < effectiveStart) continue;
      
      if (!isHabit && blocksAllocated >= blocksToAllocate) break;
      if (dateStr > effectiveDeadline) {
        if (!isHabit) {
          const overflowMinutes = (blocksToAllocate - blocksAllocated) * 45;
          overflowTasks.set(task.id, overflowMinutes);
        }
        break;
      }
      
      // Se for hábito, verificar se cai no dia da semana certo
      if (isHabit) {
        const dayOfWeek = parseDate(dateStr).getDay();
        const days = task.recurrence!.daysOfWeek || [];
        if (!days.includes(dayOfWeek)) continue;
      }
      
      const targetBlocksForThisDay = isHabit ? blocksPerRepetition : (blocksToAllocate - blocksAllocated);
      const alreadyAllocatedCount = allocatedBlocks.filter(b => b.taskId === task.id).length;
      
      // Para hábitos, ver quantos blocos já existem neste dia específico (concluídos ou agendados)
      const existingToday = allocatedBlocks.filter(b => b.taskId === task.id && b.date === dateStr).length;
      const toAllocateToday = Math.max(0, targetBlocksForThisDay - existingToday);
      
      if (toAllocateToday <= 0) continue;
      
      const dayBlocks = allocateBlocksInDay(
        task.id, daySlots, toAllocateToday, dateStr, allocatedBlocks,
        alreadyAllocatedCount + blocksAllocated
      );
      
      allocatedBlocks.push(...dayBlocks);
      blocksAllocated += dayBlocks.length;
      
      if (dayBlocks.length > 0) {
        lastAllocatedDate = dateStr;
        for (const db of dayBlocks) {
          subtractFromSlotMap(updatedSlotMap, dateStr, db.startTime, db.endTime);
        }
      }
    }
    
    if (!isHabit && blocksAllocated < blocksToAllocate && !overflowTasks.has(task.id)) {
      const overflowMinutes = (blocksToAllocate - blocksAllocated) * 45;
      overflowTasks.set(task.id, overflowMinutes);
    }
    
    dependencyCompletionDates.set(task.id, lastAllocatedDate);
  }
  
  // Fase 5: Detecção de Overflow
  const overdue: OverdueEntry[] = [];
  for (const [taskId, remainingMinutes] of overflowTasks) {
    const task = activeTasks.find(t => t.id === taskId);
    if (!task) continue;
    const deadlineDate = parseDate(task.deadline);
    const todayDate = parseDate(input.today);
    const daysOverdue = Math.max(0, differenceInDays(todayDate, deadlineDate));
    
    overdue.push({
      taskId,
      remainingDuration: remainingMinutes,
      daysOverdue,
      originalDeadline: task.deadline,
    });
  }
  overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
  
  return {
    blocks: allocatedBlocks,
    overdue,
    warnings: [] // Warnings podem ser populados aqui também
  };
}
