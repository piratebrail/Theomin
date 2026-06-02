import { useEffect } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';

export function useDayChange() {
  
  useEffect(() => {
    // Timer para detectar meia-noite em tempo real
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    const timer = setTimeout(() => {
      // Quando o dia virar
      // Quando o dia virar, em vez de recarregar a página inteira:
      // 1. Volta o calendário pro dia de hoje se não estiver visualizando o passado
      // 2. Dispara recálculo global que varrerá blocos do passado
      const { goToToday } = useCalendarStore.getState();
      goToToday();
      window.dispatchEvent(new CustomEvent('theomin:recalculate'));
    }, msUntilMidnight);
    
    return () => clearTimeout(timer);
  }, []);
}
