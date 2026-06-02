import { TaskId } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { useClassStore } from '@/stores/classStore';

interface DependencyPickerProps {
  currentTaskId?: string;
  selectedIds: TaskId[];
  onChange: (ids: TaskId[]) => void;
}

export function DependencyPicker({ currentTaskId, selectedIds, onChange }: DependencyPickerProps) {
  const { tasks } = useTaskStore();
  const { classes } = useClassStore();

  const availableTasks = tasks
    .filter(t => t.id !== currentTaskId && t.status !== 'completed')
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleToggle = (taskId: TaskId) => {
    if (selectedIds.includes(taskId)) {
      onChange(selectedIds.filter(id => id !== taskId));
    } else {
      onChange([...selectedIds, taskId]);
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
        Depende de (opcional)
      </label>
      
      {availableTasks.length === 0 ? (
        <div style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          padding: 'var(--space-sm)',
          fontStyle: 'italic',
        }}>
          Nenhuma tarefa disponível como dependência.
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          maxHeight: '140px',
          overflowY: 'auto',
        }}>
          {availableTasks.map(t => {
            const isSelected = selectedIds.includes(t.id);
            const taskClass = classes.find(c => c.id === t.classId);
            
            return (
              <label
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  borderBottom: '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isSelected) (e.currentTarget.style.background = 'var(--bg-surface)'); }}
                onMouseLeave={(e) => { e.currentTarget.style.background = isSelected ? 'var(--accent-subtle)' : 'transparent'; }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleToggle(t.id)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: 'var(--accent-base)',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                />
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 'var(--weight-medium)' : 'var(--weight-normal)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {t.name}
                </span>
                {taskClass && (
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {taskClass.name}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}
      
      {selectedIds.length > 0 && (
        <div style={{ 
          fontSize: 'var(--text-xs)', 
          color: 'var(--accent-base)', 
          marginTop: '4px',
          fontWeight: 'var(--weight-medium)',
        }}>
          {selectedIds.length} dependência{selectedIds.length > 1 ? 's' : ''} selecionada{selectedIds.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
