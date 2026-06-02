import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TaskClass } from '@/types/class';

interface CreateClassModalProps {
  onClose: () => void;
  onSave: (data: Partial<TaskClass>) => void;
  initialData?: TaskClass;
}

const COLOR_OPTIONS = [
  { label: 'Roxo', value: 'purple' },
  { label: 'Azul', value: 'blue' },
  { label: 'Ciano', value: 'cyan' },
  { label: 'Verde', value: 'green' },
  { label: 'Amarelo', value: 'yellow' },
  { label: 'Laranja', value: 'orange' },
  { label: 'Vermelho', value: 'red' },
  { label: 'Rosa', value: 'pink' },
  { label: 'Índigo', value: 'indigo' },
  { label: 'Teal', value: 'teal' },
];

export function CreateClassModal({ onClose, onSave, initialData }: CreateClassModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState(initialData?.color || 'purple');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color,
      icon: 'Tag', // default icon for now
    });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={initialData ? "Editar Classe" : "Criar Nova Classe"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>Salvar</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Faculdade"
          autoFocus
        />
        <Select
          label="Cor"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          options={COLOR_OPTIONS}
        />
      </div>
    </Modal>
  );
}
