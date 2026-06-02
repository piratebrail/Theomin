import { Minus, Plus } from 'lucide-react';

interface DurationPickerProps {
  value: number; // minutes
  onChange: (value: number) => void;
  maxBlocks?: number;
}

export function DurationPicker({ value, onChange, maxBlocks = 24 }: DurationPickerProps) {
  const currentBlocks = Math.max(1, Math.round(value / 45));
  
  const formatDuration = (minutes: number): string => {
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    if (hh === 0) return `${mm}min`;
    if (mm === 0) return `${hh}h`;
    return `${hh}h${mm}min`;
  };

  const handleDecrement = () => {
    if (currentBlocks > 1) {
      onChange((currentBlocks - 1) * 45);
    }
  };

  const handleIncrement = () => {
    if (currentBlocks < maxBlocks) {
      onChange((currentBlocks + 1) * 45);
    }
  };

  return (
    <div>
      <label style={{ 
        display: 'block', 
        marginBottom: 'var(--space-xs)', 
        fontSize: 'var(--text-sm)', 
        fontWeight: 'var(--weight-medium)',
        color: 'var(--text-secondary)' 
      }}>
        Duração
      </label>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        height: '38px',
      }}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentBlocks <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '100%',
            background: 'var(--bg-elevated)',
            border: 'none',
            borderRight: '1px solid var(--border-subtle)',
            color: currentBlocks <= 1 ? 'var(--text-disabled)' : 'var(--text-primary)',
            cursor: currentBlocks <= 1 ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <Minus size={16} />
        </button>
        
        <div style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          padding: '0 var(--space-sm)',
          userSelect: 'none',
        }}>
          {formatDuration(value)} ({currentBlocks} bloco{currentBlocks > 1 ? 's' : ''})
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentBlocks >= maxBlocks}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '100%',
            background: 'var(--bg-elevated)',
            border: 'none',
            borderLeft: '1px solid var(--border-subtle)',
            color: currentBlocks >= maxBlocks ? 'var(--text-disabled)' : 'var(--text-primary)',
            cursor: currentBlocks >= maxBlocks ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
