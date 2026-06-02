// src/stores/blockStore.ts
import { create } from 'zustand';
import { db } from '@/db/database';
import { ScheduledBlock, BlockId } from '@/types/block';

interface BlockState {
  blocks: ScheduledBlock[];
  loading: boolean;

  loadBlocks: () => Promise<void>;
  setBlocks: (blocks: ScheduledBlock[]) => Promise<void>;
  completeBlock: (id: BlockId) => Promise<void>;
  moveBlock: (id: BlockId, newDate: string, newStartTime: string, newEndTime: string) => Promise<void>;
}

export const useBlockStore = create<BlockState>((set, get) => ({
  blocks: [],
  loading: false,

  loadBlocks: async () => {
    set({ loading: true });
    const blocks = await db.blocks.toArray();
    set({ blocks, loading: false });
  },

  setBlocks: async (blocks) => {
    await db.transaction('rw', db.blocks, async () => {
      await db.blocks.clear(); // Limpa alocações antigas, ou precisamos manter os concluídos e manuais?
      // O motor de alocação fará essa lógica. Aqui apenas salvamos o novo estado completo.
      await db.blocks.bulkAdd(blocks);
    });
    await get().loadBlocks();
  },

  completeBlock: async (id) => {
    await db.blocks.update(id, { status: 'completed' });
    await get().loadBlocks();
  },

  moveBlock: async (id, newDate, newStartTime, newEndTime) => {
    await db.blocks.update(id, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      isManuallyPlaced: true
    });
    await get().loadBlocks();
  }
}));
