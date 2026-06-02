import { useEffect, useState } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export function useKeyboardShortcuts() {
  const { setViewType, goToToday, goForward, goBackward } = useCalendarStore();
  const [showHelp, setShowHelp] = useState(false);
  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case 't': goToToday(); break;
        case '1': setViewType('day'); break;
        case '2': setViewType('week'); break;
        case 'ArrowRight':
        case 'n': goForward(); break;
        case 'ArrowLeft':
        case 'p': goBackward(); break;
        case 'c': window.dispatchEvent(new CustomEvent('theomin:recalculate')); break;
        case '?': setShowHelp(true); break;
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToToday, setViewType, goForward, goBackward]);

  return {
    showHelp,
    closeHelp: () => setShowHelp(false)
  };
}
