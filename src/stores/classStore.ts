// src/stores/classStore.ts
import { create } from 'zustand';
import { db } from '@/db/database';
import { TaskClass, ClassId } from '@/types/class';
import { nanoid } from 'nanoid';

interface ClassState {
  classes: TaskClass[];
  loading: boolean;

  loadClasses: () => Promise<void>;
  addClass: (cls: Omit<TaskClass, 'id' | 'createdAt'>) => Promise<TaskClass>;
  updateClass: (id: ClassId, updates: Partial<TaskClass>) => Promise<void>;
  deleteClass: (id: ClassId) => Promise<void>;
  reorderClasses: (reorderedClasses: TaskClass[]) => Promise<void>;
}

export const useClassStore = create<ClassState>((set, get) => ({
  classes: [],
  loading: false,

  loadClasses: async () => {
    set({ loading: true });
    const classes = await db.classes.toArray();
    set({ classes, loading: false });
  },

  addClass: async (clsData) => {
    const newClass: TaskClass = {
      ...clsData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    await db.classes.add(newClass);
    await get().loadClasses();
    return newClass;
  },

  updateClass: async (id, updates) => {
    await db.classes.update(id, updates);
    await get().loadClasses();
  },

  deleteClass: async (id) => {
    await db.classes.delete(id);
    await get().loadClasses();
  },

  reorderClasses: async (reorderedClasses) => {
    // Atualiza a posição e prioridade no banco para todas as classes afetadas
    await db.transaction('rw', db.classes, async () => {
      for (const cls of reorderedClasses) {
        await db.classes.update(cls.id, {
          priorityLevel: cls.priorityLevel,
          priorityPosition: cls.priorityPosition
        });
      }
    });
    await get().loadClasses();
  }
}));
