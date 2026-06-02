# 03 — Sistema de Classes (Categorias + Prioridade)

As **classes** são o coração do sistema de priorização do Theomin. Cada tarefa pertence a uma classe, e a prioridade da classe determina a ordem de alocação no calendário.

---

## 3.1 Conceito

O sistema de classes funciona como um **quadro Kanban vertical**:

```
┌─────────────────────────────────────────────┐
│           PRIORIDADES DE CLASSES            │
├─────────────────────────────────────────────┤
│                                             │
│  Nível 0 (mais alta):                       │
│  ┌──────────┐  ┌──────────┐                │
│  │ Trabalho │  │Faculdade │                │
│  │   🔵     │  │   🟣     │                │
│  └──────────┘  └──────────┘                │
│                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                             │
│  Nível 1:                                   │
│  ┌──────────┐                              │
│  │  Saúde   │                              │
│  │   🟢     │                              │
│  └──────────┘                              │
│                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                             │
│  Nível 2:                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Pessoal  │  │  Hobby   │  │  Leitura │ │
│  │   🟠     │  │   🔴     │  │   🟡     │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     + Criar Nova Classe             │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### Regras

1. **Cada nível é uma linha horizontal**
2. **Dentro do mesmo nível**, a classe mais à esquerda tem mais prioridade
3. **Drag-and-drop** para mover classes entre níveis e dentro de um nível
4. O usuário pode criar quantos níveis quiser
5. Novos níveis são criados automaticamente ao arrastar uma classe "entre" dois níveis existentes

---

## 3.2 Componentes

### ClassBoardView (Tela principal)

```
src/components/classes/
├── ClassBoardView.tsx       # Tela completa do quadro de classes
├── PriorityLevel.tsx        # Uma linha/nível de prioridade
├── ClassCard.tsx             # Card de uma classe (bloquinho)
├── CreateClassModal.tsx      # Modal para criar/editar classe
├── ClassBoardView.css        # Estilos
```

### ClassBoardView.tsx — Estrutura

```tsx
function ClassBoardView() {
  const { classes, reorderClasses, addClass, deleteClass } = useClassStore();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  // Agrupar classes por nível de prioridade
  const levels = useMemo(() => {
    const map = new Map<number, TaskClass[]>();
    classes.forEach(cls => {
      const list = map.get(cls.priorityLevel) || [];
      list.push(cls);
      list.sort((a, b) => a.priorityPosition - b.priorityPosition);
      map.set(cls.priorityLevel, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [classes]);

  return (
    <div className="class-board">
      <header className="class-board__header">
        <h1>Classes de Atividade</h1>
        <p className="class-board__subtitle">
          Arraste para reorganizar prioridades. Topo = maior prioridade.
        </p>
      </header>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="class-board__levels">
          {levels.map(([level, classesInLevel]) => (
            <PriorityLevel
              key={level}
              level={level}
              classes={classesInLevel}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>

      <button 
        className="class-board__add-btn"
        onClick={() => setCreateModalOpen(true)}
      >
        <Plus size={20} />
        Criar Nova Classe
      </button>

      {isCreateModalOpen && (
        <CreateClassModal
          onClose={() => setCreateModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
```

### PriorityLevel.tsx — Uma linha de prioridade

```tsx
interface PriorityLevelProps {
  level: number;
  classes: TaskClass[];
  onEdit: (cls: TaskClass) => void;
  onDelete: (id: ClassId) => void;
}

function PriorityLevel({ level, classes, onEdit, onDelete }: PriorityLevelProps) {
  return (
    <div className="priority-level">
      <div className="priority-level__label">
        <span className="priority-level__number">Nível {level + 1}</span>
        {level === 0 && <span className="priority-level__badge">Mais alta</span>}
      </div>
      
      <SortableContext items={classes.map(c => c.id)} strategy={horizontalListSortingStrategy}>
        <div className="priority-level__cards">
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              taskClass={cls}
              onEdit={() => onEdit(cls)}
              onDelete={() => onDelete(cls.id)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
```

### ClassCard.tsx — Card de classe

```tsx
function ClassCard({ taskClass, onEdit, onDelete }: ClassCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: taskClass.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    '--class-color': `var(--block-${taskClass.color})`,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      className="class-card"
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="class-card__color-bar" />
      <div className="class-card__content">
        {taskClass.icon && <Icon name={taskClass.icon} size={18} />}
        <span className="class-card__name">{taskClass.name}</span>
      </div>
      <div className="class-card__actions">
        <IconButton icon={<Pencil size={14} />} onClick={onEdit} />
        <IconButton icon={<Trash2 size={14} />} onClick={onDelete} />
      </div>
    </div>
  );
}
```

---

## 3.3 Estilos (Tema Obsidiana)

```css
/* src/components/classes/ClassBoardView.css */

.class-board {
  max-width: 900px;
  margin: 0 auto;
}

.class-board__header {
  margin-bottom: var(--space-2xl);
}

.class-board__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
}

.class-board__subtitle {
  color: var(--text-secondary);
  margin-top: var(--space-xs);
}

/* ===== PRIORITY LEVEL ===== */
.priority-level {
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  transition: border-color var(--transition-fast);
}

.priority-level:hover {
  border-color: var(--border-default);
}

/* Zona de drop ativa */
.priority-level--drag-over {
  border-color: var(--accent-base);
  background: var(--accent-subtle);
  box-shadow: var(--shadow-glow);
}

.priority-level__label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.priority-level__number {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-level__badge {
  font-size: var(--text-xs);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-subtle);
  color: var(--accent-base);
  font-weight: var(--weight-medium);
}

.priority-level__cards {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
  min-height: 48px;
}

/* ===== CLASS CARD ===== */
.class-card {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  cursor: grab;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.class-card:hover {
  background: var(--bg-surface);
  border-color: var(--border-default);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.class-card:active {
  cursor: grabbing;
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
  z-index: var(--z-dropdown);
}

.class-card__color-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--class-color);
}

.class-card__content {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-primary);
  font-weight: var(--weight-medium);
  padding-left: var(--space-sm);
}

.class-card__actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  margin-left: var(--space-sm);
}

.class-card:hover .class-card__actions {
  opacity: 1;
}

/* ===== ADD BUTTON ===== */
.class-board__add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  width: 100%;
  padding: var(--space-lg);
  background: transparent;
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-weight: var(--weight-medium);
  transition: all var(--transition-fast);
  margin-top: var(--space-lg);
}

.class-board__add-btn:hover {
  border-color: var(--accent-base);
  color: var(--accent-base);
  background: var(--accent-subtle);
}
```

---

## 3.4 Modal de Criação/Edição de Classe

```
┌──────────────────────────────────┐
│  ✕                               │
│                                  │
│  Criar Nova Classe               │
│                                  │
│  Nome                            │
│  ┌────────────────────────────┐  │
│  │ Faculdade                  │  │
│  └────────────────────────────┘  │
│                                  │
│  Cor                             │
│  ○ 🟣 ○ 🔵 ● 🔵 ○ 🟢           │
│  ○ 🟡 ○ 🟠 ○ 🔴 ○ 🩷           │
│                                  │
│  Ícone (opcional)                │
│  📚 🎓 💼 ❤️ 👤 🎨 📝 ...       │
│                                  │
│  ┌────────────┐ ┌────────────┐  │
│  │  Cancelar  │ │   Salvar   │  │
│  └────────────┘ └────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### Campos

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| Nome | Texto | Sim | 1-50 caracteres, único |
| Cor | Seleção de cor | Sim | Uma das 10 cores pré-definidas |
| Ícone | Seleção de ícone | Não | Um dos ícones Lucide disponíveis |

---

## 3.5 Lógica de Drag-and-Drop

### Movimentos possíveis

1. **Mover horizontalmente** dentro do mesmo nível → Muda `priorityPosition`
2. **Mover verticalmente** para outro nível → Muda `priorityLevel` e `priorityPosition`
3. **Mover entre dois níveis** → Cria um novo nível intermediário

### Implementação com @dnd-kit

```typescript
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!active || !over) return;

  const draggedClass = findClassById(active.id);
  const overClass = findClassById(over.id);
  
  if (!draggedClass || !overClass) return;

  if (draggedClass.priorityLevel === overClass.priorityLevel) {
    // Movimentação horizontal — reordenar dentro do nível
    reorderWithinLevel(draggedClass, overClass);
  } else {
    // Movimentação vertical — mover para outro nível
    moveToLevel(draggedClass, overClass.priorityLevel);
  }
  
  // Persistir nova ordem
  reorderClasses(classes);
}
```

### Cuidados

- Ao mover a **última classe** de um nível, o nível vazio deve desaparecer
- Os `priorityLevel` devem ser **renumerados** sequencialmente (0, 1, 2...) após qualquer alteração
- Cada movimentação deve **persistir imediatamente** no IndexedDB
- Após reordenação, **não** recalcular automaticamente a agenda (só se o usuário criar nova tarefa ou clicar "recalcular")

---

## 3.6 Relação com o Algoritmo

Quando o algoritmo de alocação roda, ele:

1. Busca todas as classes ordenadas por `priorityLevel` e `priorityPosition`
2. Agrupa tarefas por classe
3. Aloca tarefas de classes de maior prioridade primeiro (menor `priorityLevel`)
4. Dentro do mesmo nível, aloca da esquerda para a direita (menor `priorityPosition`)
5. **Exceção**: se uma tarefa de prioridade menor tem deadline mais urgente, ela pode ser promovida (ver doc 06)

---

## 3.7 Exclusão de Classes

Ao excluir uma classe que possui tarefas associadas:

1. Abrir modal de confirmação
2. Mostrar quantas tarefas serão afetadas
3. Opções:
   - **Mover tarefas** para outra classe (dropdown de seleção)
   - **Excluir tarefas** junto com a classe
4. Após ação, recalcular prioridades e renumerar níveis

---

## 3.8 Checklist

- [ ] Criar `ClassBoardView.tsx` com layout do quadro
- [ ] Criar `PriorityLevel.tsx` como container de nível
- [ ] Criar `ClassCard.tsx` com drag-and-drop (@dnd-kit/sortable)
- [ ] Implementar `CreateClassModal.tsx` com form de nome, cor e ícone
- [ ] Configurar DndContext com sensores e collision detection
- [ ] Implementar reordenação horizontal (dentro do nível)
- [ ] Implementar movimentação vertical (entre níveis)
- [ ] Implementar criação automática de novos níveis
- [ ] Implementar remoção de níveis vazios
- [ ] Implementar exclusão de classe com tratamento de tarefas órfãs
- [ ] Persistir alterações no IndexedDB
- [ ] Estilizar com tema Obsidiana
- [ ] Testar drag-and-drop em todos os cenários

---

## Próximo Documento

→ [04-GERENCIAMENTO-TAREFAS.md](./04-GERENCIAMENTO-TAREFAS.md) — CRUD de tarefas, lista de tarefas, dependências e recorrências
