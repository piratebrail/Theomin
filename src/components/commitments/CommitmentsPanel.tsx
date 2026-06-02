// src/components/commitments/CommitmentsPanel.tsx

import { useState } from 'react';
import { Pin, Plus } from 'lucide-react';
import { useCommitmentStore } from '@/stores/commitmentStore';
import { CommitmentItem } from './CommitmentItem';
import { CommitmentForm } from './CommitmentForm';
import { CommitmentNotesModal } from './CommitmentNotesModal';
import { useToast } from '@/components/ui/Toast';
import './CommitmentsPanel.css';

export function CommitmentsPanel() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);
  const toast = useToast();
  
  const commitments = useCommitmentStore(state => state.commitments);
  
  const pendingCommitments = commitments
    .filter(c => !c.completed)
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const handleAdd = async (title: string, date: string) => {
    await useCommitmentStore.getState().addCommitment(title, date);
    toast.success('Compromisso criado');
    setIsAdding(false);
  };
  
  return (
    <div className="commitments-panel">
      <div className="commitments-panel__header">
        <Pin size={16} />
        <span>Compromissos Importantes</span>
      </div>
      
      <div className="commitments-panel__list">
        {pendingCommitments.map(commitment => (
          <CommitmentItem 
            key={commitment.id} 
            commitment={commitment}
            onClick={() => setEditingCommitmentId(commitment.id)}
          />
        ))}
        
        {pendingCommitments.length === 0 && !isAdding && (
          <div className="commitments-panel__empty">
            Nenhum compromisso
          </div>
        )}
      </div>
      
      {isAdding ? (
        <CommitmentForm 
          onSubmit={handleAdd} 
          onCancel={() => setIsAdding(false)} 
        />
      ) : (
        <button 
          className="commitments-panel__add-btn"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={16} />
          <span>Novo compromisso</span>
        </button>
      )}

      {editingCommitmentId && (
        <CommitmentNotesModal
          commitment={commitments.find(c => c.id === editingCommitmentId)!}
          onClose={() => setEditingCommitmentId(null)}
        />
      )}
    </div>
  );
}
