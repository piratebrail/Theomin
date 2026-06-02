import { getLocalDateString } from '@/utils/date';
import { useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useClassStore } from '@/stores/classStore';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import { runScheduler } from '@/engine/scheduler';

export function useGlobalEngine() {
  useEffect(() => {
    const handleRecalculate = async () => {
      try {
        const todayStr = getLocalDateString();
        
        // Sempre pegar o estado mais recente diretamente das stores para evitar race conditions
        const latestTasks = useTaskStore.getState().tasks;
        const latestBlocks = useTaskStore.getState().blocks;
        const latestClasses = useClassStore.getState().classes;
        const { weeklyPattern: latestWeekly, exceptions: latestExceptions } = useAvailabilityStore.getState();

        // Só rodar se tivermos dados reais carregados
        if (latestTasks.length === 0) return;

        const result = runScheduler({
          tasks: latestTasks,
          classes: latestClasses,
          weeklyAvailability: latestWeekly,
          exceptions: latestExceptions,
          existingBlocks: latestBlocks,
          today: todayStr,
          isManualRecalc: true
        });
        
        // Atualizar as stores
        const setBlocks = useTaskStore.getState().setBlocks;
        const setOverdue = useTaskStore.getState().setOverdue;
        
        setBlocks(result.blocks);
        setOverdue(result.overdue);
      } catch (e) {
        console.error("Erro fatal no motor de agendamento em background:", e);
      }
    };

    window.addEventListener('theomin:recalculate', handleRecalculate);
    return () => {
      window.removeEventListener('theomin:recalculate', handleRecalculate);
    };
  }, []);
}
