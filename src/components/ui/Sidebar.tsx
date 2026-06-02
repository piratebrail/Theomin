import { Hexagon, Calendar, CheckSquare, Layers, Clock, AlertTriangle } from 'lucide-react';
import { ViewType } from '@/types/views';
import { useTaskStore } from '@/stores/taskStore';
import { CommitmentsPanel } from '@/components/commitments/CommitmentsPanel';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const overdueCount = useTaskStore(state => state.overdue.length);

  return (
    <nav className="sidebar">
      <div className="sidebar__logo">
        <img src="/icon.png" alt="Theomin Logo" className="sidebar__logo-icon" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
        Theomin
      </div>

      <ul className="sidebar__nav">
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__nav-btn ${activeView === 'calendar' ? 'sidebar__nav-btn--active' : ''}`}
            onClick={() => onNavigate('calendar')}
          >
            <Calendar size={20} />
            <span>Calendário</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__nav-btn ${activeView === 'tasks' ? 'sidebar__nav-btn--active' : ''}`}
            onClick={() => onNavigate('tasks')}
          >
            <CheckSquare size={20} />
            <span>Tarefas</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__nav-btn ${activeView === 'classes' ? 'sidebar__nav-btn--active' : ''}`}
            onClick={() => onNavigate('classes')}
          >
            <Layers size={20} />
            <span>Classes</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__nav-btn ${activeView === 'availability' ? 'sidebar__nav-btn--active' : ''}`}
            onClick={() => onNavigate('availability')}
          >
            <Clock size={20} />
            <span>Disponibilidade</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__nav-btn ${activeView === 'overdue' ? 'sidebar__nav-btn--active' : ''}`}
            onClick={() => onNavigate('overdue')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <AlertTriangle size={20} />
              <span>Atrasadas</span>
            </div>
            {overdueCount > 0 && (
              <div style={{
                background: 'var(--color-danger)',
                color: 'white',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-bold)',
                minWidth: '20px',
                height: '20px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 6px',
                marginLeft: 'auto'
              }}>
                {overdueCount}
              </div>
            )}
          </button>
        </li>
      </ul>
      
      <CommitmentsPanel />
    </nav>
  );
}
