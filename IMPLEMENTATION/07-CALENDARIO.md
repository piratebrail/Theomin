# 07 — Calendário (Interface Visual)

Este documento cobre a construção da interface do calendário — a tela principal do Theomin. Inspirada diretamente no Google Calendar, com visões semanal e diária, exibição de blocos de 45min, intervalos e interatividade.

---

## 7.1 Referência Visual: Google Calendar

A interface se inspira no Google Calendar nos seguintes aspectos:

- **Grid temporal**: eixo Y = horas do dia, eixo X = dias da semana
- **Blocos coloridos** posicionados no grid conforme horário
- **Header** com navegação (← Hoje →) e toggle de visão (Semana/Dia)
- **Coluna de horas** à esquerda (gutter)
- **Indicador de "agora"** — linha horizontal vermelha mostrando o horário atual
- **Scroll vertical** para ver todas as horas do dia

### Diferenças em relação ao Google Calendar

| Google Calendar | Theomin |
|---|---|
| Eventos genéricos | Blocos de 45min de tarefas |
| Cores por calendário | Cores por classe de atividade |
| Eventos de dia inteiro | Não aplicável |
| Fuso horário | Não aplicável (local) |
| — | Blocos de intervalo (15min) visíveis |
| — | Blocos concluídos (esmaecidos) |
| — | Indicadores de progresso |

---

## 7.2 Layout do Calendário

### Visão Semanal

```
┌──────────────────────────────────────────────────────────────────────┐
│  ◀  Maio 2026  ▶        [ Hoje ]        [ Semana | Dia ]   🔄      │
│─────────────────────────────────────────────────────────────────────│
│        │  Seg   │  Ter   │  Qua   │  Qui   │  Sex   │  Sab  │ Dom │
│        │  25    │  26    │  27    │  28    │  29    │  30   │  31  │
│────────┼────────┼────────┼────────┼────────┼────────┼───────┼──────│
│  8:00  │        │        │        │        │        │       │      │
│────────┼────────┼────────┼────────┼────────┼────────┼───────┼──────│
│  9:00  │┌──────┐│        │┌──────┐│        │┌──────┐│       │      │
│        ││Cálc. ││        ││Cálc. ││        ││TCC   ││       │      │
│        ││ 🟣   ││        ││ 🟣   ││        ││ 🟣   ││       │      │
│  9:45  │└──────┘│        │└──────┘│        │└──────┘│       │      │
│  ------│░░░░░░░░│        │░░░░░░░░│        │░░░░░░░░│       │      │
│ 10:00  │┌──────┐│        │┌──────┐│        │┌──────┐│       │      │
│        ││Relat.││        ││Cálc. ││        ││TCC   ││       │      │
│        ││ 🔵   ││        ││ 🟣   ││        ││ 🟣   ││       │      │
│ 10:45  │└──────┘│        │└──────┘│        │└──────┘│       │      │
│────────┼────────┼────────┼────────┼────────┼────────┼───────┼──────│
│ 11:00  │        │        │        │        │        │       │      │
│  ...   │        │        │        │        │        │       │      │
│────────┼────────┼────────┼────────┼────────┼────────┼───────┼──────│
│ 14:00  │┌──────┐│┌──────┐│┌──────┐│        │        │       │      │
│        ││Treino││ │Ctrl  ││ │Relat.││       │        │       │      │
│        ││ 🟢   ││ │🟠   ││ │🔵   ││        │        │       │      │
│ 14:45  │└──────┘│└──────┘│└──────┘│        │        │       │      │
│  ...   │        │        │        │        │        │       │      │
└──────────────────────────────────────────────────────────────────────┘
```

**Legenda visual:**
- `┌──────┐` = bloco de 45min de uma tarefa (cor da classe)
- `░░░░░░░░` = intervalo de 15min (cinza transparente)
- Blocos concluídos = mesma estrutura, mas com opacidade reduzida (0.35)

### Visão Diária

```
┌────────────────────────────────────────────────────────┐
│  ◀  Quinta, 28 de Maio  ▶    [ Hoje ]  [ Semana | Dia ]│
│────────────────────────────────────────────────────────│
│         │                                              │
│  8:00   │                                              │
│─────────│──────────────────────────────────────────────│
│  9:00   │ ┌──────────────────────────────────────────┐ │
│         │ │  Estudar Cálculo III - Capítulo 5         │ │
│         │ │  🟣 Faculdade  ·  Bloco 1/3              │ │
│  9:45   │ └──────────────────────────────────────────┘ │
│         │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ 10:00   │ ┌──────────────────────────────────────────┐ │
│         │ │  Relatório Mensal                         │ │
│         │ │  🔵 Trabalho  ·  Bloco 1/5               │ │
│ 10:45   │ └──────────────────────────────────────────┘ │
│─────────│──────────────────────────────────────────────│
│ 11:00   │                                              │
│  ...    │                                              │
│─────────│──────────────────────────────────────────────│
│ 14:00   │ ┌──────────────────────────────────────────┐ │
│         │ │  Treino (horário fixo)               📌  │ │
│         │ │  🟢 Saúde  ·  45min                      │ │
│ 14:45   │ └──────────────────────────────────────────┘ │
│         │                                              │
│  ...    │                                              │
│─────────│──────────────────────────────────────────────│
│         │  ──── agora (17:54) ────────────────────     │
│─────────│──────────────────────────────────────────────│
│ 18:00   │                                              │
└────────────────────────────────────────────────────────┘
```

---

## 7.3 Componentes

```
src/components/calendar/
├── CalendarView.tsx          # Container principal (switch semana/dia)
├── CalendarHeader.tsx        # Header com navegação e controles
├── WeekView.tsx              # Grid semanal
├── DayView.tsx               # Grid diário
├── TimeGrid.tsx              # Grid de horas (compartilhado)
├── TimeGutter.tsx            # Coluna de horas à esquerda
├── DayColumn.tsx             # Coluna de um dia (na visão semanal)
├── TaskBlock.tsx             # Bloco de 45min de uma tarefa
├── BreakBlock.tsx            # Bloco de intervalo de 15min
├── NowIndicator.tsx          # Linha "agora"
├── CalendarView.css          # Estilos
```

---

## 7.4 CalendarHeader

```tsx
function CalendarHeader() {
  const { currentDate, viewType, setViewType, goBackward, goForward, goToToday } = useCalendarStore();
  
  const title = viewType === 'week'
    ? formatWeekTitle(currentDate)  // "Maio 2026"
    : formatDayTitle(currentDate);  // "Quinta, 28 de Maio"
  
  return (
    <header className="calendar-header">
      <div className="calendar-header__nav">
        <IconButton icon={<ChevronLeft />} onClick={goBackward} />
        <h1 className="calendar-header__title">{title}</h1>
        <IconButton icon={<ChevronRight />} onClick={goForward} />
      </div>
      
      <div className="calendar-header__actions">
        <Button variant="secondary" size="sm" onClick={goToToday}>
          Hoje
        </Button>
        
        <div className="calendar-header__view-toggle">
          <button 
            className={`view-toggle__btn ${viewType === 'week' ? 'active' : ''}`}
            onClick={() => setViewType('week')}
          >
            Semana
          </button>
          <button 
            className={`view-toggle__btn ${viewType === 'day' ? 'active' : ''}`}
            onClick={() => setViewType('day')}
          >
            Dia
          </button>
        </div>
        
        <IconButton 
          icon={<RefreshCw />} 
          onClick={handleRecalculate}
          tooltip="Recalcular agenda"
        />
      </div>
    </header>
  );
}
```

---

## 7.5 TimeGrid — O Grid Temporal

O grid é o componente central que renderiza as linhas de hora e posiciona os blocos.

### Cálculo de posição

```typescript
// Converter horário para posição em pixels no grid
function timeToPixels(time: string, hourHeight: number): number {
  const minutes = timeToMinutes(time);
  return (minutes / 60) * hourHeight;
}

// Calcular altura de um bloco
function blockHeight(durationMinutes: number, hourHeight: number): number {
  return (durationMinutes / 60) * hourHeight;
}

// Exemplo com hourHeight = 64px:
// 9:00 → 576px do topo
// Bloco de 45min → 48px de altura
// Intervalo de 15min → 16px de altura
```

### Renderização

```tsx
function TimeGrid({ date, blocks, breaks }: TimeGridProps) {
  const hourHeight = 64; // px por hora (CSS variable)
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23
  
  return (
    <div className="time-grid" style={{ position: 'relative' }}>
      {/* Linhas de hora */}
      {hours.map(hour => (
        <div 
          key={hour}
          className="time-grid__hour-line"
          style={{ top: hour * hourHeight }}
        />
      ))}
      
      {/* Blocos de tarefas */}
      {blocks.map(block => (
        <TaskBlock
          key={block.id}
          block={block}
          top={timeToPixels(block.startTime, hourHeight)}
          height={blockHeight(45, hourHeight)}
        />
      ))}
      
      {/* Blocos de intervalo */}
      {breaks.map((brk, i) => (
        <BreakBlock
          key={i}
          breakData={brk}
          top={timeToPixels(brk.startTime, hourHeight)}
          height={blockHeight(15, hourHeight)}
        />
      ))}
      
      {/* Indicador de "agora" */}
      {isToday(date) && <NowIndicator hourHeight={hourHeight} />}
    </div>
  );
}
```

---

## 7.6 TaskBlock — Bloco de Tarefa

```tsx
function TaskBlock({ block, top, height }: TaskBlockProps) {
  const task = useTaskStore(state => state.tasks.find(t => t.id === block.taskId));
  const taskClass = useClassStore(state => state.classes.find(c => c.id === task?.classId));
  
  const isCompleted = block.status === 'completed';
  const isPast = isDateBefore(block.date, today());
  
  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${top}px`,
    height: `${height}px`,
    left: '4px',
    right: '4px',
    '--block-color': `var(--block-${taskClass?.color || 'purple'})`,
    opacity: isCompleted ? 'var(--completed-opacity)' : 1,
  };
  
  return (
    <div 
      className={`task-block ${isCompleted ? 'task-block--completed' : ''}`}
      style={style}
      onClick={() => handleBlockClick(block)}
    >
      <div className="task-block__color-stripe" />
      <div className="task-block__content">
        <span className="task-block__name">{task?.name}</span>
        <span className="task-block__meta">
          {taskClass?.name} · Bloco {getBlockNumber(block)}/{getTotalBlocks(task)}
        </span>
      </div>
      
      {!isCompleted && !isPast && (
        <button 
          className="task-block__complete"
          onClick={(e) => { e.stopPropagation(); completeBlock(block.id); }}
          title="Marcar como concluído"
        >
          <Check size={14} />
        </button>
      )}
      
      {task?.isFixedTime && (
        <span className="task-block__pin" title="Horário fixo">📌</span>
      )}
    </div>
  );
}
```

---

## 7.7 BreakBlock — Bloco de Intervalo

```tsx
function BreakBlock({ breakData, top, height }: BreakBlockProps) {
  return (
    <div 
      className="break-block"
      style={{
        position: 'absolute',
        top: `${top}px`,
        height: `${height}px`,
        left: '4px',
        right: '4px',
      }}
    >
      <span className="break-block__label">Intervalo</span>
    </div>
  );
}
```

---

## 7.8 NowIndicator — Linha "Agora"

```tsx
function NowIndicator({ hourHeight }: { hourHeight: number }) {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);
  
  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = (minutes / 60) * hourHeight;
  
  return (
    <div className="now-indicator" style={{ top: `${top}px` }}>
      <div className="now-indicator__dot" />
      <div className="now-indicator__line" />
    </div>
  );
}
```

---

## 7.9 Navegação entre Visões

### Troca seamless semana ↔ dia

```typescript
// Ao trocar de semana para dia: foca no dia que estava no centro da semana (ou hoje)
function switchToDay() {
  const weekDates = getWeekDates(currentDate);
  const todayInWeek = weekDates.find(d => isToday(d));
  setCurrentDate(todayInWeek || weekDates[0]);
  setViewType('day');
}

// Ao trocar de dia para semana: mostra a semana que contém o dia atual
function switchToWeek() {
  // currentDate já é o dia focado, a semana é calculada a partir dele
  setViewType('week');
}

// Navegação
function goForward() {
  if (viewType === 'week') {
    setCurrentDate(addDays(currentDate, 7));
  } else {
    setCurrentDate(addDays(currentDate, 1));
  }
}

function goBackward() {
  if (viewType === 'week') {
    setCurrentDate(addDays(currentDate, -7));
  } else {
    setCurrentDate(addDays(currentDate, -1));
  }
}
```

### Clicar em um dia na visão semanal → ir para visão diária desse dia

```tsx
// No header da coluna do dia na visão semanal
<button 
  className="day-column__date"
  onClick={() => { setCurrentDate(date); setViewType('day'); }}
>
  {formatDayNumber(date)}
</button>
```

---

## 7.10 Drag-and-Drop no Calendário

O usuário pode **arrastar blocos** no calendário para reorganizar manualmente.

### Regras

1. Só pode mover blocos **não concluídos** e **não no passado**
2. O bloco movido é marcado como `isManuallyPlaced = true`
3. Blocos manuais **resistem ao recálculo automático**
4. Só perdem o status manual com o botão "Recalcular" (recálculo manual)

### Implementação

```tsx
function handleBlockDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (!over) return;
  
  const blockId = active.id as string;
  const { date, time } = parseDropTarget(over.id); // Ex: "2026-05-28_14:00"
  
  // Snap para grade de 15 minutos
  const snappedTime = snapToGrid(time, 15);
  
  // Mover o bloco
  moveBlock(blockId, date, snappedTime);
}
```

---

## 7.11 Estilos (Tema Obsidiana)

```css
/* src/components/calendar/CalendarView.css */

/* ===== CALENDAR HEADER ===== */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  margin-bottom: var(--space-lg);
}

.calendar-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.calendar-header__title {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
  min-width: 200px;
  text-align: center;
}

/* View toggle */
.calendar-header__view-toggle {
  display: flex;
  background: var(--bg-base);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-toggle__btn {
  padding: 6px 16px;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.view-toggle__btn.active {
  background: var(--accent-base);
  color: white;
}

.view-toggle__btn:hover:not(.active) {
  background: var(--bg-elevated);
}

/* ===== TIME GRID ===== */
.time-grid-container {
  display: flex;
  height: calc(100vh - 140px);
  overflow-y: auto;
  background: var(--bg-deep);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

/* Gutter (coluna de horas) */
.time-gutter {
  width: var(--calendar-gutter);
  flex-shrink: 0;
  border-right: 1px solid var(--border-subtle);
}

.time-gutter__hour {
  height: var(--calendar-hour-height);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0 var(--space-sm);
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: var(--font-mono);
  transform: translateY(-6px);
}

/* Grid area */
.time-grid {
  flex: 1;
  position: relative;
  min-height: calc(24 * var(--calendar-hour-height));
}

.time-grid__hour-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--calendar-line-color);
}

/* ===== WEEK VIEW ===== */
.week-view {
  display: flex;
  flex: 1;
}

.day-column {
  flex: 1;
  border-right: 1px solid var(--border-subtle);
  position: relative;
}

.day-column:last-child {
  border-right: none;
}

.day-column__header {
  text-align: center;
  padding: var(--space-sm);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  background: var(--bg-base);
  z-index: var(--z-sticky);
}

.day-column__weekday {
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.day-column__date {
  font-size: var(--text-lg);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.day-column__date:hover {
  background: var(--bg-elevated);
}

.day-column__date--today {
  background: var(--accent-base);
  color: white;
}

/* ===== TASK BLOCK ===== */
.task-block {
  position: absolute;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
  display: flex;
  background: color-mix(in srgb, var(--block-color) 15%, var(--bg-elevated));
  border: 1px solid color-mix(in srgb, var(--block-color) 30%, transparent);
}

.task-block:hover {
  box-shadow: var(--shadow-md);
  transform: scale(1.01);
  z-index: var(--z-base);
}

.task-block--completed {
  opacity: var(--completed-opacity);
  cursor: default;
}

.task-block--completed:hover {
  transform: none;
  box-shadow: none;
}

.task-block__color-stripe {
  width: 3px;
  background: var(--block-color);
  flex-shrink: 0;
}

.task-block__content {
  flex: 1;
  padding: 2px 6px;
  min-width: 0;
  overflow: hidden;
}

.task-block__name {
  display: block;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-block__meta {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-block__complete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin: 2px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  flex-shrink: 0;
  opacity: 0;
}

.task-block:hover .task-block__complete {
  opacity: 1;
}

.task-block__complete:hover {
  background: var(--color-success);
  color: white;
}

/* ===== BREAK BLOCK ===== */
.break-block {
  position: absolute;
  background: var(--break-bg);
  border: 1px dashed var(--break-border);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.break-block__label {
  font-size: 9px;
  color: var(--text-disabled);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ===== NOW INDICATOR ===== */
.now-indicator {
  position: absolute;
  left: 0;
  right: 0;
  z-index: var(--z-sticky);
  pointer-events: none;
}

.now-indicator__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-danger);
  position: absolute;
  left: -5px;
  top: -4px;
}

.now-indicator__line {
  height: 2px;
  background: var(--color-danger);
  width: 100%;
}
```

---

## 7.12 Scroll Automático

Ao abrir o calendário, fazer scroll automático para:

1. **Se hoje está visível**: scroll para o horário atual - 1h
2. **Se é dia futuro**: scroll para o primeiro bloco agendado
3. **Se é dia passado**: scroll para o primeiro bloco concluído

```typescript
useEffect(() => {
  const container = gridRef.current;
  if (!container) return;
  
  if (isToday(currentDate)) {
    const now = new Date();
    const scrollTo = Math.max(0, (now.getHours() - 1) * hourHeight);
    container.scrollTop = scrollTo;
  }
}, [currentDate, viewType]);
```

---

## 7.13 Responsividade

### Breakpoints

| Largura | Comportamento |
|---|---|
| ≥ 1200px | Visão semanal completa (7 colunas) |
| 768px – 1199px | Visão semanal compactada (nomes curtos: Seg, Ter...) |
| < 768px | Forçar visão diária (esconder toggle de semana) |

Na visão semanal compactada, os blocos mostram apenas o nome da tarefa (sem meta).

---

## 7.14 Checklist

- [ ] Criar `CalendarView.tsx` (container com switch)
- [ ] Criar `CalendarHeader.tsx` (navegação, toggle, botão recalcular)
- [ ] Criar `WeekView.tsx` (grid semanal com 7 colunas)
- [ ] Criar `DayView.tsx` (grid diário expandido)
- [ ] Criar `TimeGrid.tsx` (linhas de hora, posicionamento)
- [ ] Criar `TimeGutter.tsx` (coluna de horas)
- [ ] Criar `DayColumn.tsx` (coluna de um dia)
- [ ] Criar `TaskBlock.tsx` (bloco de tarefa com cor, nome, meta)
- [ ] Criar `BreakBlock.tsx` (intervalo cinza transparente)
- [ ] Criar `NowIndicator.tsx` (linha vermelha "agora")
- [ ] Implementar cálculo de posição (timeToPixels)
- [ ] Implementar navegação (forward, backward, today)
- [ ] Implementar troca seamless semana ↔ dia
- [ ] Implementar clique no número do dia → visão diária
- [ ] Implementar drag-and-drop para reorganização manual
- [ ] Implementar scroll automático para horário atual
- [ ] Implementar botão de completar bloco no hover
- [ ] Estilizar blocos concluídos (opacidade reduzida)
- [ ] Estilizar blocos de horário fixo (📌)
- [ ] Implementar responsividade (mobile → forçar dia)
- [ ] Estilizar com tema Obsidiana completo
- [ ] Testar com muitos blocos em um dia
- [ ] Testar navegação para semanas passadas/futuras

---

## Próximo Documento

→ [08-PROGRESSO-RECALCULO.md](./08-PROGRESSO-RECALCULO.md) — Marcação de progresso e lógica de recálculo
