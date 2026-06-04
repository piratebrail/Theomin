// src/stores/taskStore.ts
import { create } from 'zustand';
import { db } from '@/db/database';
import type { Task, TaskId } from '@/types/task';
import { ScheduledBlock } from '@/types/block';
import { OverdueEntry } from '@/engine/scheduler';
import { timeToMinutes } from '@/utils/validation';
import confetti from 'canvas-confetti';
import { nanoid } from 'nanoid';

interface TaskState {
  tasks: Task[];
  blocks: ScheduledBlock[];
  overdue: OverdueEntry[];
  loading: boolean;
  
  // Actions
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedDuration' | 'status'>) => Promise<Task>;
  updateTask: (id: TaskId, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: TaskId) => Promise<void>;
  completeTask: (id: TaskId) => Promise<void>;
  uncompleteTask: (id: TaskId) => Promise<void>;
  setBlocks: (blocks: ScheduledBlock[]) => void;
  setOverdue: (overdue: OverdueEntry[]) => void;
  completeBlock: (blockId: string) => Promise<void>;
  uncompleteBlock: (blockId: string) => Promise<void>;
  updateBlock: (blockId: string, updates: Partial<ScheduledBlock>) => Promise<void>;
  deleteBlockWithUndo: (blockId: string) => Promise<() => Promise<void>>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  blocks: [],
  overdue: [],
  loading: false,

  loadTasks: async () => {
    set({ loading: true });
    const tasks = await db.tasks.toArray();
    const dbBlocks = await db.blocks.toArray();
    
    // Auto-cleanup de blocos órfãos (para bancos de dados que sofreram exclusão antes da correção)
    const taskIds = new Set(tasks.map(t => t.id));
    const orphanedBlockIds = dbBlocks.filter(b => !taskIds.has(b.taskId)).map(b => b.id);
    
    if (orphanedBlockIds.length > 0) {
      await db.blocks.bulkDelete(orphanedBlockIds);
    }
    
    const validDbBlocks = dbBlocks.filter(b => taskIds.has(b.taskId));
    
    // Combinar blocos carregados do DB com os atuais do state
    const currentBlocks = get().blocks;
    const mergedBlocks = [...validDbBlocks];
    
    for (const b of currentBlocks) {
      if (!mergedBlocks.find(mb => mb.id === b.id) && taskIds.has(b.taskId)) {
        mergedBlocks.push(b);
      }
    }
    
    set({ tasks, blocks: mergedBlocks, loading: false });
  },

  addTask: async (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedDuration: 0,
      status: 'pending',
    };
    await db.tasks.add(newTask);
    await get().loadTasks();
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
    return newTask;
  },

  updateTask: async (id, updates) => {
    await db.tasks.update(id, { ...updates, updatedAt: new Date().toISOString() });
    await get().loadTasks();
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
  },

  deleteTask: async (id) => {
    // 1. Deletar a tarefa
    await db.tasks.delete(id);
    
    // 2. Deletar todos os blocos órfãos (salvos no DB) que pertenciam a essa tarefa
    const blocksToDelete = await db.blocks.where('taskId').equals(id).primaryKeys();
    if (blocksToDelete.length > 0) {
      await db.blocks.bulkDelete(blocksToDelete as string[]);
    }
    
    // 3. Limpar dependências (dependsOn) de outras tarefas que dependiam desta
    const allTasks = await db.tasks.toArray();
    const tasksToUpdate = allTasks.filter(t => t.dependsOn.includes(id));
    for (const t of tasksToUpdate) {
      await db.tasks.update(t.id, {
        dependsOn: t.dependsOn.filter(depId => depId !== id),
        updatedAt: new Date().toISOString()
      });
    }
    
    // 4. Remover blocos em memória e recarregar
    set(state => ({
      blocks: state.blocks.filter(b => b.taskId !== id)
    }));
    
    await get().loadTasks();
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
  },

  completeTask: async (id) => {
    const state = get();
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    // Pegar todos os blocos gerados para essa task no estado atual
    const taskBlocks = state.blocks.filter(b => b.taskId === id);
    
    // Salvar todos eles no DB como completed para que não sumam (Phase 2 vai pegá-los)
    const blocksToSave = taskBlocks.map(b => ({ ...b, status: 'completed' as const }));
    if (blocksToSave.length > 0) {
      await db.blocks.bulkPut(blocksToSave);
    }
    
    await db.tasks.update(id, { 
      status: 'completed', 
      completedDuration: task.totalDuration,
      updatedAt: new Date().toISOString() 
    });
    
    // Confetti para conclusão de tarefa
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    await get().loadTasks();
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
  },

  uncompleteTask: async (id) => {
    const state = get();
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;
    
    // Apagar todos os blocos do DB para esta task (assim eles voltam a ser gerados soltos)
    const blocksToDelete = await db.blocks.where('taskId').equals(id).primaryKeys();
    if (blocksToDelete.length > 0) {
      await db.blocks.bulkDelete(blocksToDelete as string[]);
    }
    
    // Remover do state local pra sumir na hora
    set(s => ({ blocks: s.blocks.filter(b => b.taskId !== id) }));
    
    await db.tasks.update(id, { 
      status: 'pending', 
      completedDuration: 0,
      updatedAt: new Date().toISOString() 
    });
    
    await get().loadTasks();
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
  },

  setBlocks: (blocks) => set({ blocks }),
  
  setOverdue: (overdue) => set({ overdue }),

  completeBlock: async (blockId) => {
    const state = get();
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const task = state.tasks.find(t => t.id === block.taskId);
    if (!task) return;
    
    const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
    const newCompletedDuration = (task.completedDuration || 0) + duration;
    
    // Hábitos nunca ficam "completed" permanentemente. 
    // Tasks normais ficam "completed" se a duração bater o total.
    const newStatus = task.isRecurring 
      ? 'in_progress' 
      : (newCompletedDuration >= task.totalDuration ? 'completed' : 'in_progress');
    
    // Atualizar bloco
    const updatedBlock = { ...block, status: 'completed' as const };
    await db.blocks.put(updatedBlock); // Salva no IndexedDB
    
    // Atualizar task
    await db.tasks.update(task.id, { 
      completedDuration: newCompletedDuration,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    
    // Atualizar UI state
    set(s => ({
      blocks: s.blocks.map(b => b.id === blockId ? updatedBlock : b),
      tasks: s.tasks.map(t => t.id === task.id ? { ...t, completedDuration: newCompletedDuration, status: newStatus } : t)
    }));
    
    if (newStatus === 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      // Confetti menor para conclusão de bloco
      confetti({
        particleCount: 40,
        spread: 40,
        origin: { y: 0.7 }
      });
    }
    
    // Dispara recálculo global
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
  },

  uncompleteBlock: async (blockId) => {
    const state = get();
    const block = state.blocks.find(b => b.id === blockId);
    if (!block || block.status !== 'completed') return;
    
    const task = state.tasks.find(t => t.id === block.taskId);
    if (!task) return;
    
    const duration = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
    const newCompletedDuration = Math.max(0, (task.completedDuration || 0) - duration);
    
    const newStatus = task.isRecurring 
      ? (newCompletedDuration > 0 ? 'in_progress' : 'pending')
      : (newCompletedDuration >= task.totalDuration ? 'completed' : (newCompletedDuration > 0 ? 'in_progress' : 'pending'));
    
    // Atualizar bloco (se não foi colocado manualmente, podemos até remover do DB)
    const updatedBlock = { ...block, status: 'scheduled' as const };
    if (!block.isManuallyPlaced) {
      await db.blocks.delete(block.id);
    } else {
      await db.blocks.put(updatedBlock);
    }
    
    // Atualizar task
    await db.tasks.update(task.id, { 
      completedDuration: newCompletedDuration,
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    
    // Atualizar UI state
    set(s => ({
      blocks: s.blocks.map(b => b.id === blockId ? updatedBlock : b),
      tasks: s.tasks.map(t => t.id === task.id ? { ...t, completedDuration: newCompletedDuration, status: newStatus } : t)
    }));
    
    // Dispara recálculo global
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
  },

  updateBlock: async (blockId, updates) => {
    const state = get();
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const updatedBlock = { ...block, ...updates };
    
    // Save to DB
    await db.blocks.put(updatedBlock);
    
    // Update memory
    set(s => ({
      blocks: s.blocks.map(b => b.id === blockId ? updatedBlock : b)
    }));
    
    // Since manual placements resist recalc, we might just fire recalculate 
    // to let the engine fit other tasks around this newly pinned block.
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
  },

  deleteBlockWithUndo: async (blockId) => {
    const state = get();
    const block = state.blocks.find(b => b.id === blockId);
    if (!block) return async () => {};
    
    const task = state.tasks.find(t => t.id === block.taskId);
    if (!task) return async () => {};

    const durationToReduce = timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
    const isCompleted = block.status === 'completed';

    // Criar snapshots para a funcionalidade de Desfazer
    const taskSnapshot = { ...task };
    const blockSnapshot = { ...block };

    // Apagar bloco
    await db.blocks.delete(block.id);
    const newBlocks = state.blocks.filter(b => b.id !== block.id);
    
    const newTotalDuration = task.totalDuration - durationToReduce;
    const newCompletedDuration = isCompleted ? Math.max(0, task.completedDuration - durationToReduce) : task.completedDuration;
    
    let newTasks = state.tasks;
    
    if (newTotalDuration <= 0) {
      // Se era o último tempo da tarefa, excluir a tarefa completamente
      await db.tasks.delete(task.id);
      newTasks = newTasks.filter(t => t.id !== task.id);
    } else {
      let newStatus = task.status;
      if (!task.isRecurring) {
        if (newCompletedDuration >= newTotalDuration) newStatus = 'completed';
        else if (newCompletedDuration > 0) newStatus = 'in_progress';
        else newStatus = 'pending';
      }

      const updates: Partial<Task> = {
        totalDuration: newTotalDuration,
        completedDuration: newCompletedDuration,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // Caso contrário, apenas reduzir o tempo total e atualizar status
      await db.tasks.update(task.id, updates);
      newTasks = newTasks.map(t => t.id === task.id ? { ...t, ...updates } : t);
    }

    set({ blocks: newBlocks, tasks: newTasks });
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));

    // Retorna a função Undo
    return async () => {
      // Restaura a task
      const currentTask = await db.tasks.get(task.id);
      if (!currentTask) {
        await db.tasks.add(taskSnapshot);
      } else {
        await db.tasks.update(task.id, { 
          totalDuration: taskSnapshot.totalDuration,
          updatedAt: taskSnapshot.updatedAt
        });
      }
      
      // Restaura o bloco
      await db.blocks.put(blockSnapshot);

      await get().loadTasks();
      window.dispatchEvent(new CustomEvent('theomin:recalculate'));
    };
  }
}));
