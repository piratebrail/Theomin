import { BreakBlock as BreakBlockType } from '@/engine/break-calculator';

interface BreakBlockProps {
  breakData: BreakBlockType;
  top: number;
  height: number;
}

export function BreakBlock({ top, height }: BreakBlockProps) {
  return (
    <div 
      className="break-block"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: '4px',
        right: '4px',
      }}
    >
      <span className="break-block__label">Intervalo</span>
    </div>
  );
}
