import { Hexagon, Calendar, CheckSquare, Layers, Clock, AlertTriangle, Download, Upload } from 'lucide-react';
import { ViewType } from '@/types/views';
import { useTaskStore } from '@/stores/taskStore';
import { CommitmentsPanel } from '@/components/commitments/CommitmentsPanel';
import { exportDatabase, importDatabase } from '@/utils/backup';
import { useRef, useState } from 'react';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const overdueCount = useTaskStore(state => state.overdue.length);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      await exportDatabase();
    } catch (err) {
      alert("Erro ao exportar backup.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (confirm("ATENÇÃO: Importar um backup apagará TODOS os dados atuais.\nTem certeza que deseja continuar?")) {
      try {
        setIsProcessing(true);
        await importDatabase(file);
        alert("Backup importado com sucesso! O aplicativo será recarregado.");
        window.location.reload();
      } catch (err) {
        alert("Erro ao importar backup. Verifique se o arquivo JSON é válido.");
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <nav className="sidebar">
      <div className="sidebar__logo">
        <span>Theomin</span>
        <img src="/icon-512.png" alt="Theomin Logo" className="sidebar__logo-icon" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
      </div>

      <ul className="sidebar__nav" style={{ listStyle: 'none', margin: 0, padding: '0 var(--space-md)' }}>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__item ${activeView === 'calendar' ? 'sidebar__item--active' : ''}`}
            onClick={() => onNavigate('calendar')}
          >
            <Calendar size={20} />
            <span>Calendário</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__item ${activeView === 'tasks' ? 'sidebar__item--active' : ''}`}
            onClick={() => onNavigate('tasks')}
          >
            <CheckSquare size={20} />
            <span>Tarefas</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__item ${activeView === 'classes' ? 'sidebar__item--active' : ''}`}
            onClick={() => onNavigate('classes')}
          >
            <Layers size={20} />
            <span>Classes</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__item ${activeView === 'availability' ? 'sidebar__item--active' : ''}`}
            onClick={() => onNavigate('availability')}
          >
            <Clock size={20} />
            <span>Disponibilidade</span>
          </button>
        </li>
        <li className="sidebar__nav-item">
          <button 
            className={`sidebar__item ${activeView === 'overdue' ? 'sidebar__item--active' : ''}`}
            onClick={() => onNavigate('overdue')}
          >
            <AlertTriangle size={20} />
            <span>Atrasadas</span>
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

      <div style={{ marginTop: 'auto', padding: 'var(--space-md) var(--space-sm)', display: 'flex', gap: 'var(--space-xs)' }}>
        <button 
          className="sidebar__item" 
          onClick={handleExport}
          disabled={isProcessing}
          title="Exportar Backup (Download de Dados)"
          style={{ justifyContent: 'center', padding: 'var(--space-sm)', flex: 1 }}
        >
          <Upload size={18} />
        </button>
        
        <button 
          className="sidebar__item" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          title="Importar Backup (Restaurar Dados)"
          style={{ justifyContent: 'center', padding: 'var(--space-sm)', flex: 1 }}
        >
          <Download size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".json"
          onChange={handleImport}
        />
      </div>
    </nav>
  );
}
