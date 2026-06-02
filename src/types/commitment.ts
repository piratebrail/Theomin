// src/types/commitment.ts

export type CommitmentId = string;  // nanoid

export interface Commitment {
  id: CommitmentId;
  
  /** Título do compromisso (ex: "Prova de Cálculo III") */
  title: string;
  
  /** Data do compromisso */
  date: string;  // ISO date string 'YYYY-MM-DD'
  
  /** Se já foi concluído/passou */
  completed: boolean;
  
  /** Data de criação */
  createdAt: string;  // ISO datetime
  
  /** Anotações opcionais sobre o compromisso */
  notes?: string;
  
  /** Lista de caminhos de arquivos locais vinculados */
  linkedFiles?: string[];
}
