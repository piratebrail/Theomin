import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TaskClass } from '@/types/class';

interface DeleteClassModalProps {
  taskClass: TaskClass;
  otherClasses: TaskClass[];
  affectedTasksCount: number;
  onClose: () => void;
  onConfirm: (action: 'move' | 'delete', targetClassId?: string) => void;
}

export function DeleteClassModal({ taskClass, otherClasses, affectedTasksCount, onClose, onConfirm }: DeleteClassModalProps) {
  const [action, setAction] = useState<'move' | 'delete'>(otherClasses.length > 0 ? 'move' : 'delete');
  const [targetClassId, setTargetClassId] = useState<string>(otherClasses[0]?.id || '');

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Excluir Classe"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button 
            variant="primary" 
            onClick={() => onConfirm(action, targetClassId)}
            disabled={action === 'move' && !targetClassId}
            style={action === 'delete' ? { background: 'var(--color-danger)', borderColor: 'var(--color-danger)' } : {}}
          >
            Confirmar Exclusão
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <p>
          Você está prestes a excluir a classe <strong>{taskClass.name}</strong>.
        </p>
        
        {affectedTasksCount > 0 ? (
          <>
            <p style={{ color: 'var(--color-warning)' }}>
              Existem <strong>{affectedTasksCount}</strong> tarefas associadas a esta classe. O que deseja fazer com elas?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="deleteAction" 
                  checked={action === 'move'} 
                  onChange={() => setAction('move')}
                  disabled={otherClasses.length === 0}
                />
                Mover tarefas para outra classe
              </label>
              
              {action === 'move' && (
                <div style={{ marginLeft: 'var(--space-xl)' }}>
                  <Select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    options={otherClasses.map(c => ({ label: c.name, value: c.id }))}
                  />
                </div>
              )}
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="deleteAction" 
                  checked={action === 'delete'} 
                  onChange={() => setAction('delete')}
                />
                Excluir todas as {affectedTasksCount} tarefas
              </label>
            </div>
          </>
        ) : (
          <p>Não há tarefas associadas a esta classe. Pode excluir com segurança.</p>
        )}
      </div>
    </Modal>
  );
}
