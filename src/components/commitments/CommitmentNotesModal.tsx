import { useState } from 'react';
import { Commitment } from '@/types/commitment';
import { useCommitmentStore } from '@/stores/commitmentStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { FileText, Link as LinkIcon, Trash2, Plus, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface CommitmentNotesModalProps {
  commitment: Commitment;
  onClose: () => void;
}

export function CommitmentNotesModal({ commitment, onClose }: CommitmentNotesModalProps) {
  const { updateCommitment } = useCommitmentStore();
  const toast = useToast();
  
  const [notes, setNotes] = useState(commitment.notes || '');
  const [linkedFiles, setLinkedFiles] = useState<string[]>(commitment.linkedFiles || []);
  const [newFile, setNewFile] = useState('');
  
  const handleSave = async () => {
    await updateCommitment(commitment.id, {
      notes,
      linkedFiles
    });
    toast.success('Anotações salvas com sucesso!');
    onClose();
  };

  const handleAddFile = () => {
    if (!newFile.trim()) return;
    if (linkedFiles.includes(newFile.trim())) {
      toast.error('Este arquivo já está na lista.');
      return;
    }
    setLinkedFiles([...linkedFiles, newFile.trim()]);
    setNewFile('');
  };

  const handleRemoveFile = (pathToRemove: string) => {
    setLinkedFiles(linkedFiles.filter(path => path !== pathToRemove));
  };
  
  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast.success('Caminho copiado para a área de transferência!');
  };

  const footer = (
    <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', width: '100%' }}>
      <Button variant="secondary" onClick={onClose}>Cancelar</Button>
      <Button variant="primary" onClick={handleSave}>Salvar</Button>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title={`Notas: ${commitment.title}`} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        {/* Anotações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontWeight: 'var(--weight-bold)' }}>
            <FileText size={16} />
            Anotações Gerais
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escreva detalhes importantes sobre este compromisso aqui..."
            style={{
              width: '100%',
              height: '150px',
              padding: 'var(--space-md)',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Arquivos Vinculados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', fontWeight: 'var(--weight-bold)' }}>
            <LinkIcon size={16} />
            Arquivos Locais Vinculados
          </label>
          
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <input
              type="text"
              value={newFile}
              onChange={(e) => setNewFile(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
              placeholder="Ex: C:\Users\Piratebrail\Documentos\relatorio.pdf"
              style={{
                flex: 1,
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
            />
            <Button variant="secondary" onClick={handleAddFile} style={{ gap: 'var(--space-xs)' }}>
              <Plus size={16} /> Adicionar
            </Button>
          </div>
          
          {linkedFiles.length > 0 && (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-xs)',
              marginTop: 'var(--space-sm)'
            }}>
              {linkedFiles.map((path, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: 'var(--text-sm)', 
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }} title={path}>
                    {path}
                  </span>
                  
                  <div style={{ display: 'flex', gap: 'var(--space-xs)', marginLeft: 'var(--space-md)' }}>
                    <button
                      onClick={() => handleCopyPath(path)}
                      title="Copiar caminho"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveFile(path)}
                      title="Remover arquivo"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-danger)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </Modal>
  );
}
