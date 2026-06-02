import { getLocalDateString } from '@/utils/date';
import { useCalendarStore } from '@/stores/calendarStore';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS_LONG = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

function formatDayTitle(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

function formatWeekTitle(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function CalendarHeader({ onRecalculate }: { onRecalculate: () => void }) {
  const { currentDate, viewType, setViewType, goToToday, setCurrentDate } = useCalendarStore();
  
  const title = viewType === 'week'
    ? formatWeekTitle(currentDate)
    : formatDayTitle(currentDate);
    
  const goForward = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() + (viewType === 'week' ? 7 : 1));
    setCurrentDate(getLocalDateString(d));
  };
  
  const goBackward = () => {
    const d = new Date(currentDate + 'T00:00:00');
    d.setDate(d.getDate() - (viewType === 'week' ? 7 : 1));
    setCurrentDate(getLocalDateString(d));
  };
  
  return (
    <header className="calendar-header">
      <div className="calendar-header__nav">
        <button className="button button--ghost" onClick={goBackward} style={{ padding: '8px' }}>
          <ChevronLeft size={20} />
        </button>
        <h1 className="calendar-header__title">{title}</h1>
        <button className="button button--ghost" onClick={goForward} style={{ padding: '8px' }}>
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="calendar-header__actions">
        <Button variant="secondary" onClick={goToToday}>
          Hoje
        </Button>
        
        <div className="calendar-header__view-toggle">
          <button 
            className={`view-toggle__btn ${viewType === 'week' ? 'active' : ''}`}
            onClick={() => setViewType('week')}
          >
            Semana
          </button>
          <button 
            className={`view-toggle__btn ${viewType === 'day' ? 'active' : ''}`}
            onClick={() => setViewType('day')}
          >
            Dia
          </button>
        </div>
        
        <button 
          className="button button--ghost" 
          onClick={onRecalculate}
          title="Recalcular agenda"
          style={{ padding: '8px' }}
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </header>
  );
}
