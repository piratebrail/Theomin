// src/components/commitments/CommitmentForm.tsx

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface CommitmentFormProps {
  onSubmit: (title: string, date: string) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialDate?: string;
}

export function CommitmentForm({ 
  onSubmit, 
  onCancel, 
  initialTitle = '', 
  initialDate = '' 
}: CommitmentFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const titleRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  
  const handleSubmit = () => {
    if (!title.trim() || !date) return;
    onSubmit(title.trim(), date);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onCancel();
  };
  
  return (
    <div className="commitment-form">
      <input
        ref={titleRef}
        className="commitment-form__input"
        placeholder="Título do compromisso..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <input
        type="date"
        className="commitment-form__date"
        value={date}
        onChange={e => setDate(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="commitment-form__actions">
        <button 
          className="commitment-form__btn commitment-form__btn--confirm"
          onClick={handleSubmit}
          disabled={!title.trim() || !date}
          title="Confirmar"
        >
          <Check size={14} />
        </button>
        <button 
          className="commitment-form__btn commitment-form__btn--cancel"
          onClick={onCancel}
          title="Cancelar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
