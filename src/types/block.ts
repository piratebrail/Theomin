// src/types/block.ts
import { TaskId, BlockId } from './task';
export type { BlockId };

/** Status de um bloco individual */
export type BlockStatus = 'scheduled' | 'completed' | 'missed';

/** Um bloco de 45 minutos alocado no calendário */
export interface ScheduledBlock {
  id: BlockId;
  
  /** ID da tarefa a que pertence */
  taskId: TaskId;
  
  /** Data do bloco */
  date: string; // 'YYYY-MM-DD'
  
  /** Horário de início */
  startTime: string; // 'HH:mm'
  
  /** Horário de fim (sempre startTime + 45min) */
  endTime: string;   // 'HH:mm'
  
  /** Status do bloco */
  status: BlockStatus;
  
  /** Se foi posicionado manualmente pelo usuário (resiste a recálculos até "recalcular") */
  isManuallyPlaced: boolean;
  
  /** Ordem de renderização (para posicionamento visual) */
  order: number;
}

/** Bloco de intervalo (15 minutos entre tarefas) */
export interface BreakBlock {
  date: string;
  startTime: string;
  endTime: string;
  
  /** IDs dos blocos de tarefa antes e depois deste intervalo */
  beforeBlockId: BlockId;
  afterBlockId: BlockId;
}
