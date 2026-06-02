interface ProgressBarProps {
  progress: number; // 0 to 1
  totalBlocks: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  const isComplete = pct === 100;
  
  return (
    <div className="task-card__progress">
      <div className="progress-bar">
        <div 
          className={`progress-bar__fill ${isComplete ? 'progress-bar__fill--complete' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}
