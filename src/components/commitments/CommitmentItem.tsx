// src/components/commitments/CommitmentItem.tsx

import { useState } from 'react';
import { Calendar, Check, Trash2 } from 'lucide-react';
import { Commitment } from '@/types/commitment';
import { useCommitmentStore } from '@/stores/commitmentStore';
import { useToast } from '@/components/ui/Toast';
import { format, parseISO, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommitmentItemProps {
  commitment: Commitment;
  onClick?: () => void;
}

export function CommitmentItem({ commitment, onClick }: CommitmentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const { toggleCompleted, deleteCommitment } = useCommitmentStore();
  const toast = useToast();
  
  const date = parseISO(commitment.date);
  // Remove a hora para o cálculo de diferença de dias ser preciso apenas na data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const commitmentDate = new Date(date);
  commitmentDate.setHours(0, 0, 0, 0);
  const daysUntil = differenceInDays(commitmentDate, today);
  
  // Formatar label de data
  const getDateLabel = (): string => {
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    if (daysUntil < 0) return `${Math.abs(daysUntil)}d atrás`;
    if (daysUntil <= 7) return `em ${daysUntil}d`;
    return format(date, 'dd/MM', { locale: ptBR });
  };
  
  // Classe CSS para urgência
  const getUrgencyClass = (): string => {
    if (isPast(date) && !isToday(date)) return 'commitment-item--overdue';
    if (isToday(date)) return 'commitment-item--today';
    if (daysUntil <= 3) return 'commitment-item--urgent';
    return '';
  };
  
  const handleDelete = async () => {
    await deleteCommitment(commitment.id);
    toast.success('Compromisso excluído');
  };
  
  const getBgClass = (): string => {
    if (commitment.completed) return '';
    if (daysUntil < 0) return 'commitment-item--bg-red'; // Atrasado também é vermelho
    if (daysUntil < 7) return 'commitment-item--bg-red';
    if (daysUntil <= 15) return 'commitment-item--bg-yellow';
    return '';
  };
  
  return (
    <div 
      className={`commitment-item ${getUrgencyClass()} ${getBgClass()} ${commitment.completed ? 'commitment-item--completed' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <button 
        className="commitment-item__checkbox"
        onClick={() => toggleCompleted(commitment.id)}
        title={commitment.completed ? 'Desmarcar' : 'Marcar como concluído'}
      >
        {commitment.completed && <Check size={12} />}
      </button>
      
      <div 
        className="commitment-item__content" 
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <span className="commitment-item__title">{commitment.title}</span>
        <span className="commitment-item__date">
          <Calendar size={10} />
          {format(date, 'dd/MM', { locale: ptBR })}
        </span>
      </div>
      
      <div className="commitment-item__right">
        {showActions ? (
          <button 
            className="commitment-item__delete"
            onClick={handleDelete}
            title="Excluir compromisso"
          >
            <Trash2 size={12} />
          </button>
        ) : (
          <span className="commitment-item__days-badge">
            {daysUntil >= 0 ? `${daysUntil} dias` : 'Atrasado'}
          </span>
        )}
      </div>
    </div>
  );
}
