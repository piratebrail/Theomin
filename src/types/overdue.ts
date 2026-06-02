// src/types/overdue.ts
import { TaskId, Duration } from './task';

/** Uma tarefa (ou parte dela) que está atrasada */
export interface OverdueEntry {
  taskId: TaskId;
  
  /** Tempo que faltou alocar (minutos) */
  remainingDuration: Duration;
  
  /** Quanto tempo está atrasada (em dias) */
  daysOverdue: number;
  
  /** Deadline original */
  originalDeadline: string;
}
