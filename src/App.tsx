import { useState, useEffect } from 'react';
import { Sidebar } from '@components/ui/Sidebar';
import { CalendarView } from '@components/calendar/CalendarView';
import { TaskListView } from '@components/tasks/TaskListView';
import { ClassBoardView } from '@components/classes/ClassBoardView';
import { AvailabilityView } from '@components/availability/AvailabilityView';
import { OverduePanel } from '@components/overdue/OverduePanel';
import { useTaskStore } from '@/stores/taskStore';
import { useClassStore } from '@/stores/classStore';
import { useAvailabilityStore } from '@/stores/availabilityStore';
import { useCommitmentStore } from '@/stores/commitmentStore';
import { ViewType } from '@/types/views';
import { db } from '@/db/database';
import { seedDatabase } from '@/db/seed';
import { useDayChange } from '@/hooks/useDayChange';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGlobalEngine } from '@/hooks/useGlobalEngine';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('calendar');
  const [isReady, setIsReady] = useState(false);

  useDayChange();
  const { showHelp, closeHelp } = useKeyboardShortcuts();
  useGlobalEngine();

  // Envia "sinais de vida" para o servidor. Se fechar a aba, os sinais param e o servidor se desliga.
  useEffect(() => {
    const pingInterval = setInterval(() => {
      fetch('/api/ping').catch(() => {});
    }, 3000);
    return () => clearInterval(pingInterval);
  }, []);

  useEffect(() => {
    seedDatabase().then(async () => {
      await loadData();
    });
  }, []);

  const loadData = async () => {
    await Promise.all([
      useTaskStore.getState().loadTasks(),
      useClassStore.getState().loadClasses(),
      useAvailabilityStore.getState().loadAvailability(),
      useCommitmentStore.getState().loadCommitments()
    ]);
    
    window.dispatchEvent(new CustomEvent('theomin:recalculate'));
    setIsReady(true);
  };

  if (!isReady) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-deep)'
      }}>
        <div style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--accent-base)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          THEOMIN
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="app-main">
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'tasks' && <TaskListView />}
        {activeView === 'classes' && <ClassBoardView />}
        {activeView === 'availability' && <AvailabilityView />}
        {activeView === 'overdue' && <OverduePanel />}
      </main>

      {showHelp && (
        <Modal isOpen={true} onClose={closeHelp} title="Atalhos de Teclado" footer={<Button variant="primary" onClick={closeHelp}>Fechar</Button>}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <li><kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>t</kbd> - Ir para Hoje</li>
            <li><kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>1</kbd> - Visão Diária</li>
            <li><kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>2</kbd> - Visão Semanal</li>
            <li><kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>→</kbd> ou <kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>n</kbd> - Próximo dia/semana</li>
            <li><kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>←</kbd> ou <kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>p</kbd> - Dia/semana anterior</li>
            <li><kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>c</kbd> - Recalcular agenda</li>
            <li><kbd style={{ background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>?</kbd> - Mostrar estes atalhos</li>
          </ul>
        </Modal>
      )}
    </div>
  );
}

export default App;
