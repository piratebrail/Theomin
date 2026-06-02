import { useState, useMemo, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useClassStore } from '@/stores/classStore';
import { TaskClass, ClassId } from '@/types/class';
import { PriorityLevel } from './PriorityLevel';
import { CreateClassModal } from './CreateClassModal';
import { ClassCard } from './ClassCard';
import { DeleteClassModal } from './DeleteClassModal';
import { useTaskStore } from '@/stores/taskStore';
import { useToast } from '@/components/ui/Toast';

export function ClassBoardView() {
  const { classes, loadClasses, addClass, updateClass, deleteClass, reorderClasses } = useClassStore();
  const { tasks, updateTask, deleteTask: deleteStoredTask } = useTaskStore();
  const toast = useToast();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<TaskClass | undefined>(undefined);
  const [deletingClass, setDeletingClass] = useState<TaskClass | undefined>(undefined);
  const [activeId, setActiveId] = useState<ClassId | null>(null);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const levels = useMemo(() => {
    const map = new Map<number, TaskClass[]>();
    classes.forEach(cls => {
      const list = map.get(cls.priorityLevel) || [];
      list.push(cls);
      list.sort((a, b) => a.priorityPosition - b.priorityPosition);
      map.set(cls.priorityLevel, list);
    });
    
    // Garantir que todos os níveis até o máximo existam (mesmo se vazios, exceto se for o último)
    if (map.size > 0) {
      const maxLevel = Math.max(...Array.from(map.keys()));
      for (let i = 0; i <= maxLevel; i++) {
        if (!map.has(i)) map.set(i, []);
      }
    } else {
      map.set(0, []);
    }

    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [classes]);

  const getNextPosition = (level: number) => {
    const levelClasses = classes.filter(c => c.priorityLevel === level);
    return levelClasses.length > 0 ? Math.max(...levelClasses.map(c => c.priorityPosition)) + 1 : 0;
  };

  const handleSave = async (cls: Omit<TaskClass, 'id' | 'createdAt'>) => {
    if (editingClass) {
      await updateClass(editingClass.id, cls);
      toast.success('Classe atualizada com sucesso');
    } else {
      const position = getNextPosition(cls.priorityLevel);
      await addClass({ ...cls, priorityPosition: position });
      toast.success('Classe criada com sucesso');
    }
    setCreateModalOpen(false);
    setEditingClass(undefined);
  };

  const mapSize = () => {
    return new Set(classes.map(c => c.priorityLevel)).size;
  }

  const handleDeleteClick = (id: ClassId) => {
    const cls = classes.find(c => c.id === id);
    if (cls) {
      setDeletingClass(cls);
    }
  };

  const handleDeleteConfirm = async (action: 'move' | 'delete', targetClassId?: string) => {
    if (!deletingClass) return;

    const affectedTasks = tasks.filter(t => t.classId === deletingClass.id);

    if (action === 'move' && targetClassId) {
      for (const task of affectedTasks) {
        await updateTask(task.id, { classId: targetClassId });
      }
    } else if (action === 'delete') {
      for (const task of affectedTasks) {
        await deleteStoredTask(task.id);
      }
    }

    await deleteClass(deletingClass.id);
    
    // Normalize levels after deletion
    const newClasses = useClassStore.getState().classes;
    const uniqueLevels = Array.from(new Set(newClasses.map(c => c.priorityLevel))).sort((a, b) => a - b);
    const normalizedClasses = newClasses.map(c => ({
      ...c,
      priorityLevel: uniqueLevels.indexOf(c.priorityLevel)
    }));
    await reorderClasses(normalizedClasses);

    toast.success('Classe excluída com sucesso');
    setDeletingClass(undefined);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!active || !over) return;

    const activeCls = classes.find(c => c.id === active.id);
    if (!activeCls) return;

    const overId = over.id as string;
    const isOverLevel = overId.startsWith('level-');
    
    let newClasses = [...classes];

    if (isOverLevel) {
      const targetLevel = parseInt(overId.replace('level-', ''), 10);
      if (activeCls.priorityLevel !== targetLevel) {
        // Move to empty level or end of level
        const levelClasses = newClasses.filter(c => c.priorityLevel === targetLevel);
        const activeIndex = newClasses.findIndex(c => c.id === activeCls.id);
        
        newClasses[activeIndex] = {
          ...activeCls,
          priorityLevel: targetLevel,
          priorityPosition: levelClasses.length
        };
      }
    } else {
      const overCls = classes.find(c => c.id === overId);
      if (overCls && activeCls.id !== overCls.id) {
        if (activeCls.priorityLevel === overCls.priorityLevel) {
          // Reorder within same level
          const levelClasses = newClasses.filter(c => c.priorityLevel === activeCls.priorityLevel)
                                         .sort((a, b) => a.priorityPosition - b.priorityPosition);
          const oldIndex = levelClasses.findIndex(c => c.id === activeCls.id);
          const newIndex = levelClasses.findIndex(c => c.id === overCls.id);
          
          const newLevelOrder = arrayMove(levelClasses, oldIndex, newIndex);
          
          newLevelOrder.forEach((cls, idx) => {
            const globalIdx = newClasses.findIndex(c => c.id === cls.id);
            newClasses[globalIdx] = { ...cls, priorityPosition: idx };
          });
        } else {
          // Move to different level at specific position
          const activeIndex = newClasses.findIndex(c => c.id === activeCls.id);
          newClasses[activeIndex] = {
            ...activeCls,
            priorityLevel: overCls.priorityLevel,
            priorityPosition: overCls.priorityPosition
          };
          
          // Shift others in the target level
          const targetLevelClasses = newClasses.filter(c => c.priorityLevel === overCls.priorityLevel && c.id !== activeCls.id)
                                             .sort((a, b) => a.priorityPosition - b.priorityPosition);
          
          targetLevelClasses.splice(overCls.priorityPosition, 0, newClasses[activeIndex]);
          
          targetLevelClasses.forEach((cls, idx) => {
            const globalIdx = newClasses.findIndex(c => c.id === cls.id);
            newClasses[globalIdx] = { ...cls, priorityPosition: idx };
          });
        }
      }
    }

    // Cleanup: Remove empty levels and re-normalize level numbers
    const uniqueLevels = Array.from(new Set(newClasses.map(c => c.priorityLevel))).sort((a, b) => a - b);
    newClasses = newClasses.map(cls => ({
      ...cls,
      priorityLevel: uniqueLevels.indexOf(cls.priorityLevel)
    }));

    reorderClasses(newClasses);
  };

  const activeClass = classes.find(c => c.id === activeId);

  return (
    <div className="class-board">
      <header className="class-board__header">
        <h1>Classes de Atividade</h1>
        <p className="class-board__subtitle">
          Arraste para reorganizar prioridades. Topo = maior prioridade.
        </p>
      </header>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="class-board__levels">
          {levels.map(([level, classesInLevel]) => (
            <PriorityLevel
              key={level}
              level={level}
              classes={classesInLevel}
              onEdit={(cls) => { setEditingClass(cls); setCreateModalOpen(true); }}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeClass ? (
            <ClassCard 
              taskClass={activeClass} 
              onEdit={() => {}} 
              onDelete={() => {}} 
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <button 
        className="class-board__add-btn"
        onClick={() => { setEditingClass(undefined); setCreateModalOpen(true); }}
      >
        <Plus size={20} />
        Criar Nova Classe
      </button>

      {isCreateModalOpen && (
        <CreateClassModal
          onClose={() => { setCreateModalOpen(false); setEditingClass(undefined); }}
          onSave={handleSave}
          initialData={editingClass}
        />
      )}

      {deletingClass && (
        <DeleteClassModal
          taskClass={deletingClass}
          otherClasses={classes.filter(c => c.id !== deletingClass.id)}
          affectedTasksCount={tasks.filter(t => t.classId === deletingClass.id).length}
          onClose={() => setDeletingClass(undefined)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
