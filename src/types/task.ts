// src/types/task.ts

export type TaskId = string;       // nanoid
export type ClassId = string;      // nanoid
export type BlockId = string;      // nanoid

/** Duração em minutos — sempre múltiplos de 45 */
export type Duration = number;

/** Status de uma tarefa */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

/** Tipo de recorrência */
export type RecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Task {
  id: TaskId;
  
  /** Nome da tarefa */
  name: string;
  
  /** Duração total em minutos (múltiplos de 45: 45, 90, 135, 180...) */
  totalDuration: Duration;
  
  /** Duração já concluída em minutos */
  completedDuration: Duration;
  
  /** Data de início (quando pode começar a ser agendada) */
  startDate: string;  // ISO date string 'YYYY-MM-DD'
  
  /** Deadline — a tarefa deve ficar pronta no dia ANTERIOR a esta data */
  deadline: string;   // ISO date string 'YYYY-MM-DD'
  
  /** ID da classe/categoria */
  classId: ClassId;
  
  /** Status atual */
  status: TaskStatus;
  
  /** IDs das tarefas das quais esta depende (predecessoras) */
  dependsOn: TaskId[];
  
  /** Se é uma tarefa recorrente */
  isRecurring: boolean;
  
  /** Configuração de recorrência (se isRecurring = true) */
  recurrence?: RecurrenceConfig;
  
  /** Se tem horário fixo (independente do tempo livre) */
  isFixedTime: boolean;
  
  /** Horário fixo, se aplicável */
  fixedTime?: FixedTimeConfig;
  
  /** Notas opcionais */
  notes?: string;
  
  /** Data de criação */
  createdAt: string;  // ISO datetime
  
  /** Data da última atualização */
  updatedAt: string;  // ISO datetime
}

export interface RecurrenceConfig {
  /** Tipo de recorrência */
  type: RecurrenceType;
  
  /** Dias da semana em que recorre (0=dom, 1=seg, ..., 6=sab) */
  daysOfWeek?: number[];
  
  /** Dia do mês (para recorrência mensal) */
  dayOfMonth?: number;
  
  /** Data de fim da recorrência (opcional — null = infinita) */
  endDate?: string | null;
}

export interface FixedTimeConfig {
  /** Horário de início fixo (ex: "14:00") */
  startTime: string;  // 'HH:mm'
  
  /** Dias da semana em que ocorre */
  daysOfWeek: number[];
}
