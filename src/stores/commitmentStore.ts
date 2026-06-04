import { create } from 'zustand';
import { db } from '@/db/database';
import { Commitment, CommitmentId } from '@/types/commitment';
import { nanoid } from 'nanoid';
import { useTaskStore } from '@/stores/taskStore';

interface CommitmentState {
  commitments: Commitment[];
  loading: boolean;
  
  loadCommitments: () => Promise<void>;
  addCommitment: (title: string, date: string) => Promise<Commitment>;
  updateCommitment: (id: CommitmentId, updates: Partial<Commitment>) => Promise<void>;
  deleteCommitment: (id: CommitmentId) => Promise<void>;
  toggleCompleted: (id: CommitmentId) => Promise<void>;
}

export const useCommitmentStore = create<CommitmentState>((set, get) => ({
  commitments: [],
  loading: false,
  
  loadCommitments: async () => {
    set({ loading: true });
    const commitments = await db.commitments.toArray();
    set({ commitments, loading: false });
  },
  
  addCommitment: async (title: string, date: string) => {
    const commitment: Commitment = {
      id: nanoid(),
      title,
      date,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    await db.commitments.add(commitment);
    set(state => ({ commitments: [...state.commitments, commitment] }));
    return commitment;
  },
  
  updateCommitment: async (id, updates) => {
    await db.commitments.update(id, updates);
    set(state => ({
      commitments: state.commitments.map(c => 
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
  },
  
  deleteCommitment: async (id) => {
    // Desvincular tarefas deste compromisso
    const { tasks, updateTask } = useTaskStore.getState();
    const relatedTasks = tasks.filter(t => t.commitmentId === id);
    for (const t of relatedTasks) {
      await updateTask(t.id, { commitmentId: undefined });
    }

    await db.commitments.delete(id);
    set(state => ({
      commitments: state.commitments.filter(c => c.id !== id),
    }));
  },
  
  toggleCompleted: async (id) => {
    const commitment = get().commitments.find(c => c.id === id);
    if (!commitment) return;
    
    const newCompleted = !commitment.completed;
    await db.commitments.update(id, { completed: newCompleted });
    
    // Se marcado como concluído, concluir tarefas associadas pendentes
    if (newCompleted) {
      const { tasks, completeTask } = useTaskStore.getState();
      const relatedTasks = tasks.filter(t => t.commitmentId === id && t.status !== 'completed');
      for (const t of relatedTasks) {
        await completeTask(t.id);
      }
    }
    
    set(state => ({
      commitments: state.commitments.map(c =>
        c.id === id ? { ...c, completed: newCompleted } : c
      ),
    }));
  }
}));
