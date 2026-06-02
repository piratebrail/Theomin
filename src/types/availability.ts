// src/types/availability.ts

/** Dia da semana: 0=domingo, 1=segunda, ..., 6=sábado */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Uma faixa de tempo disponível */
export interface TimeSlot {
  /** Horário de início (ex: "09:00") */
  startTime: string; // 'HH:mm'
  
  /** Horário de fim (ex: "10:45") */
  endTime: string;   // 'HH:mm'
}

/** Disponibilidade padrão semanal */
export interface WeeklyAvailability {
  /** Uma entrada para cada dia da semana */
  [day: number]: TimeSlot[];  // DayOfWeek → lista de faixas
}

/** Exceção de disponibilidade para um dia específico */
export interface AvailabilityException {
  id: string;
  
  /** Data específica */
  date: string; // 'YYYY-MM-DD'
  
  /** Faixas de tempo para este dia (substitui o padrão semanal) */
  slots: TimeSlot[];
  
  /** Se true, o dia inteiro fica indisponível */
  isDayOff: boolean;
  
  /** Descrição (ex: "Feriado Nacional") */
  description?: string;
}
