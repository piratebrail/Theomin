# 09 — Sistema de Tarefas Atrasadas

Este documento cobre o painel de tarefas atrasadas (overdue), sua detecção, apresentação e como o usuário pode reagir.

---

## 9.1 Conceito

Uma tarefa (ou parte dela) é considerada **atrasada** quando:

1. O deadline passou e a tarefa não está 100% concluída
2. O algoritmo de alocação não consegue encaixar todos os blocos antes do deadline
3. Uma tarefa depende de outra que atrasou, causando um efeito cascata

### Tipos de atraso

| Tipo | Descrição |
|---|---|
| **Total** | A tarefa inteira não cabe no prazo — 0 blocos alocados no calendário |
| **Parcial** | Parte da tarefa cabe no prazo, parte não — blocos divididos entre calendário e overdue |
| **Cascata** | Tarefa atrasou porque sua dependência atrasou |

### Overflow parcial

A funcionalidade mais sutil: se uma tarefa de 10h (≈13 blocos) tem apenas 5h (≈7 slots) disponíveis antes do deadline:
- **7 blocos** → no calendário (normalmente)
- **6 blocos** (≈4h30) → na aba de atrasadas

---

## 9.2 Detecção de Atraso

A detecção acontece na **Fase 5 do algoritmo de alocação** (doc 06), mas também pode ser calculada em tempo real:

```typescript
// src/engine/overdue-detector.ts

function detectOverdueTasks(
  tasks: Task[], 
  blocks: ScheduledBlock[], 
  today: string
): OverdueEntry[] {
  const overdueEntries: OverdueEntry[] = [];
  
  for (const task of tasks) {
    if (task.status === 'completed') continue;
    if (task.isFixedTime) continue; // Fixas não atrasam
    
    const remainingDuration = task.totalDuration - task.completedDuration;
    if (remainingDuration <= 0) continue;
    
    // Deadline efetivo (dia anterior ao deadline)
    const effectiveDeadline = formatDate(addDays(parseDate(task.deadline), -1));
    
    // Blocos agendados ANTES do deadline (que podem ser cumpridos)
    const scheduledBeforeDeadline = blocks.filter(b =>
      b.taskId === task.id &&
      b.status === 'scheduled' &&
      b.date <= effectiveDeadline
    );
    
    const scheduledMinutes = scheduledBeforeDeadline.length * 45;
    
    // Quanto falta que NÃO está agendado antes do deadline?
    const overflowMinutes = remainingDuration - scheduledMinutes;
    
    if (overflowMinutes > 0) {
      const deadlineDate = parseDate(task.deadline);
      const todayDate = parseDate(today);
      const daysOverdue = Math.max(0, differenceInDays(todayDate, deadlineDate));
      
      overdueEntries.push({
        taskId: task.id,
        remainingDuration: overflowMinutes,
        daysOverdue,
        originalDeadline: task.deadline,
      });
    }
  }
  
  // Ordenar: mais atrasada primeiro (maior daysOverdue)
  overdueEntries.sort((a, b) => b.daysOverdue - a.daysOverdue);
  
  return overdueEntries;
}
```

---

## 9.3 Interface: Painel de Atrasadas

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  ⚠️ Tarefas Atrasadas (4)                                       │
│  ───────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🔴  Entregar relatório trimestral                        │  │
│  │      🔵 Trabalho                                          │  │
│  │                                                            │  │
│  │      Deadline: 25/05 (3 dias atrasada)                    │  │
│  │      Faltam: 3h45 (5 blocos)                              │  │
│  │                                                            │  │
│  │      ┌─────────────────────┐  ┌──────────────────────┐    │  │
│  │      │  Adiar deadline →   │  │  Encaixar na agenda  │    │  │
│  │      └─────────────────────┘  └──────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟡  Estudar Cálculo III - Cap 4                          │  │
│  │      🟣 Faculdade                                         │  │
│  │                                                            │  │
│  │      Deadline: 26/05 (2 dias atrasada)                    │  │
│  │      Faltam: 1h45 (2 blocos)                              │  │
│  │      ⚡ Dependência bloqueada: "Estudar Cap 5"            │  │
│  │                                                            │  │
│  │      ┌─────────────────────┐  ┌──────────────────────┐    │  │
│  │      │  Adiar deadline →   │  │  Encaixar na agenda  │    │  │
│  │      └─────────────────────┘  └──────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟡  Preparar slides da apresentação                      │  │
│  │      🔵 Trabalho                                          │  │
│  │                                                            │  │
│  │      Deadline: 27/05 (1 dia atrasada)                     │  │
│  │      Faltam: 2h45 (3 blocos)                              │  │
│  │      ⚠️ Overflow parcial — 45min no calendário            │  │
│  │                                                            │  │
│  │      ┌─────────────────────┐  ┌──────────────────────┐    │  │
│  │      │  Adiar deadline →   │  │  Encaixar na agenda  │    │  │
│  │      └─────────────────────┘  └──────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  🟢  Revisão do TCC - Bibliografia                       │  │
│  │      🟣 Faculdade                                         │  │
│  │                                                            │  │
│  │      Deadline: 28/05 (hoje — vence amanhã)                │  │
│  │      Faltam: 45min (1 bloco)                              │  │
│  │                                                            │  │
│  │      ┌─────────────────────┐  ┌──────────────────────┐    │  │
│  │      │  Adiar deadline →   │  │  Encaixar na agenda  │    │  │
│  │      └─────────────────────┘  └──────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ───────────────────────────────────────────────────────────────  │
│                                                                  │
│  📊 Resumo: 8h45 de trabalho necessárias para desafogar         │
│             (≈ 11 blocos de 45min)                               │
│                                                                  │
│  Estimativa: com sua disponibilidade atual,                      │
│              você desafogaria em ~3 dias úteis.                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9.4 Componentes

```
src/components/overdue/
├── OverduePanel.tsx          # Tela principal
├── OverdueCard.tsx           # Card de uma tarefa atrasada
├── OverdueSummary.tsx        # Resumo no rodapé
├── OverdueBadge.tsx          # Badge numérico na sidebar
├── OverduePanel.css          # Estilos
```

### OverdueCard

```tsx
function OverdueCard({ entry }: { entry: OverdueEntry }) {
  const task = useTaskStore(state => state.tasks.find(t => t.id === entry.taskId));
  const taskClass = useClassStore(state => state.classes.find(c => c.id === task?.classId));
  
  // Cores de severidade baseadas em daysOverdue
  const severity = entry.daysOverdue >= 3 ? 'critical' 
    : entry.daysOverdue >= 1 ? 'warning' 
    : 'mild';
  
  const blocksRemaining = entry.remainingDuration / 45;
  const durationLabel = formatDuration(entry.remainingDuration);
  
  // Verificar se há overflow parcial (alguns blocos no calendário)
  const scheduledBlocks = useBlockStore(state => 
    state.blocks.filter(b => b.taskId === entry.taskId && b.status === 'scheduled')
  );
  const isPartial = scheduledBlocks.length > 0;
  
  // Verificar dependências afetadas
  const dependentTasks = useTaskStore(state => 
    state.tasks.filter(t => t.dependsOn.includes(entry.taskId) && t.status !== 'completed')
  );
  
  return (
    <div className={`overdue-card overdue-card--${severity}`}>
      <div className="overdue-card__severity-indicator" />
      
      <div className="overdue-card__content">
        <h3 className="overdue-card__name">{task?.name}</h3>
        
        <div className="overdue-card__class">
          <span 
            className="overdue-card__class-dot" 
            style={{ background: `var(--block-${taskClass?.color})` }} 
          />
          {taskClass?.name}
        </div>
        
        <div className="overdue-card__details">
          <p>
            <strong>Deadline:</strong> {formatDate(entry.originalDeadline)}
            {entry.daysOverdue > 0 
              ? ` (${entry.daysOverdue} dia${entry.daysOverdue > 1 ? 's' : ''} atrasada)`
              : ' (vence amanhã)'}
          </p>
          <p>
            <strong>Faltam:</strong> {durationLabel} ({blocksRemaining} bloco{blocksRemaining > 1 ? 's' : ''})
          </p>
        </div>
        
        {isPartial && (
          <div className="overdue-card__partial-notice">
            ⚠️ Overflow parcial — {scheduledBlocks.length * 45}min no calendário
          </div>
        )}
        
        {dependentTasks.length > 0 && (
          <div className="overdue-card__dependency-notice">
            ⚡ Bloqueando: {dependentTasks.map(t => `"${t.name}"`).join(', ')}
          </div>
        )}
      </div>
      
      <div className="overdue-card__actions">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => openRescheduleModal(entry.taskId)}
        >
          Adiar deadline →
        </Button>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => forceAllocate(entry.taskId)}
        >
          Encaixar na agenda
        </Button>
      </div>
    </div>
  );
}
```

---

## 9.5 Ações do Usuário

### "Adiar deadline"

Abre um modal para escolher nova data de deadline:

```typescript
async function rescheduleOverdueTask(taskId: TaskId, newDeadline: string) {
  await updateTask(taskId, { deadline: newDeadline });
  // Recálculo automático é disparado pelo updateTask
}
```

### "Encaixar na agenda"

Força a alocação dos blocos remanescentes nos próximos slots disponíveis, **ignorando o deadline original**:

```typescript
async function forceAllocate(taskId: TaskId) {
  const task = await db.tasks.get(taskId);
  if (!task) return;
  
  // Atualizar deadline para uma data futura (ex: +30 dias)
  const newDeadline = formatDate(addDays(new Date(), 30));
  await updateTask(taskId, { deadline: newDeadline });
  // Recálculo automático vai encaixar os blocos
}
```

---

## 9.6 Resumo (OverdueSummary)

```tsx
function OverdueSummary({ entries }: { entries: OverdueEntry[] }) {
  const totalMinutes = entries.reduce((sum, e) => sum + e.remainingDuration, 0);
  const totalBlocks = totalMinutes / 45;
  const durationLabel = formatDuration(totalMinutes);
  
  // Calcular dias para desafogar com base na disponibilidade média
  const avgDailyBlocks = calculateAverageDailyBlocks();
  const daysToRecover = Math.ceil(totalBlocks / avgDailyBlocks);
  
  return (
    <div className="overdue-summary">
      <div className="overdue-summary__stat">
        <span className="overdue-summary__label">
          Tempo total para desafogar:
        </span>
        <span className="overdue-summary__value">
          {durationLabel} ({totalBlocks} blocos)
        </span>
      </div>
      
      <div className="overdue-summary__estimate">
        Com sua disponibilidade atual, você desafogaria em ~{daysToRecover} dia{daysToRecover > 1 ? 's' : ''} úteis.
      </div>
    </div>
  );
}
```

---

## 9.7 Badge na Sidebar

A sidebar mostra um badge vermelho com o número de tarefas atrasadas:

```tsx
// No Sidebar.tsx
<NavItem
  icon={<AlertTriangle />}
  label="Atrasadas"
  active={activeView === 'overdue'}
  onClick={() => setView('overdue')}
  badge={overdueCount > 0 ? overdueCount : undefined}
  badgeVariant="danger"
/>
```

### Animação do badge

Quando o número de atrasadas muda, o badge faz um "pulse" sutil:

```css
.sidebar-badge--danger {
  background: var(--color-danger);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  min-width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: badge-pulse 300ms ease;
}

@keyframes badge-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

---

## 9.8 Notificação de Atraso

Quando o algoritmo detecta novas tarefas atrasadas (após recálculo), mostrar uma notificação proeminente:

```tsx
function OverdueNotification({ newOverdueCount }: { newOverdueCount: number }) {
  if (newOverdueCount === 0) return null;
  
  return (
    <div className="overdue-notification">
      <AlertTriangle size={24} />
      <div>
        <strong>{newOverdueCount} tarefa{newOverdueCount > 1 ? 's' : ''} atrasada{newOverdueCount > 1 ? 's' : ''}</strong>
        <p>Verifique o painel de atrasadas para agir.</p>
      </div>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => navigateTo('overdue')}
      >
        Ver →
      </Button>
    </div>
  );
}
```

---

## 9.9 Estilos (Tema Obsidiana)

```css
/* src/components/overdue/OverduePanel.css */

.overdue-panel {
  max-width: 800px;
  margin: 0 auto;
}

.overdue-panel__header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-2xl);
}

.overdue-panel__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--color-danger);
}

/* ===== OVERDUE CARD ===== */
.overdue-card {
  display: flex;
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-md);
  transition: all var(--transition-fast);
}

.overdue-card:hover {
  border-color: var(--border-default);
  box-shadow: var(--shadow-sm);
}

.overdue-card__severity-indicator {
  width: 4px;
  flex-shrink: 0;
}

.overdue-card--critical .overdue-card__severity-indicator {
  background: var(--color-danger);
}

.overdue-card--warning .overdue-card__severity-indicator {
  background: var(--color-warning);
}

.overdue-card--mild .overdue-card__severity-indicator {
  background: var(--color-info);
}

.overdue-card__content {
  flex: 1;
  padding: var(--space-lg);
}

.overdue-card__name {
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.overdue-card__class {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.overdue-card__class-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.overdue-card__details {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.8;
}

.overdue-card__details strong {
  color: var(--text-primary);
}

.overdue-card__partial-notice,
.overdue-card__dependency-notice {
  font-size: var(--text-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  margin-top: var(--space-sm);
}

.overdue-card__partial-notice {
  background: hsla(38, 80%, 55%, 0.1);
  color: var(--color-warning);
}

.overdue-card__dependency-notice {
  background: hsla(265, 70%, 58%, 0.1);
  color: var(--accent-base);
}

.overdue-card__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-lg);
  justify-content: center;
}

/* ===== OVERDUE SUMMARY ===== */
.overdue-summary {
  background: hsla(0, 65%, 55%, 0.08);
  border: 1px solid hsla(0, 65%, 55%, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  margin-top: var(--space-xl);
}

.overdue-summary__stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.overdue-summary__label {
  color: var(--text-secondary);
}

.overdue-summary__value {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--color-danger);
}

.overdue-summary__estimate {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* ===== OVERDUE NOTIFICATION ===== */
.overdue-notification {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-xl);
  background: var(--bg-base);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: slideUp 300ms ease;
  z-index: var(--z-toast);
}
```

---

## 9.10 Checklist

- [ ] Criar `OverduePanel.tsx` (tela principal)
- [ ] Criar `OverdueCard.tsx` com severidade visual e ações
- [ ] Criar `OverdueSummary.tsx` com tempo total e estimativa
- [ ] Criar `OverdueBadge.tsx` para a sidebar
- [ ] Implementar `detectOverdueTasks()` no engine
- [ ] Implementar ação "Adiar deadline" com modal de data
- [ ] Implementar ação "Encaixar na agenda" com extensão de deadline
- [ ] Implementar notificação quando novas atrasadas aparecem
- [ ] Implementar indicador de overflow parcial
- [ ] Implementar indicador de dependências bloqueadas
- [ ] Implementar badge na sidebar com pulse animation
- [ ] Estilizar com tema Obsidiana
- [ ] Testar: atraso total, parcial, cascata, edge cases

---

## Próximo Documento

→ [10-INTEGRACAO-POLISH.md](./10-INTEGRACAO-POLISH.md) — Integração de todos os sistemas, edge cases e polish
