// src/types/class.ts

export type ClassId = string;

export interface TaskClass {
  id: ClassId;
  
  /** Nome da classe (ex: "Faculdade", "Saúde", "Trabalho") */
  name: string;
  
  /** Cor atribuída (key do design token, ex: "purple", "blue") */
  color: string;
  
  /** Nível de prioridade (0 = mais alta). Múltiplas classes podem ter o mesmo nível. */
  priorityLevel: number;
  
  /** Posição horizontal dentro do mesmo nível (0 = mais à esquerda = mais prioritário) */
  priorityPosition: number;
  
  /** Ícone (nome do ícone Lucide) */
  icon?: string;
  
  /** Data de criação */
  createdAt: string;
}
