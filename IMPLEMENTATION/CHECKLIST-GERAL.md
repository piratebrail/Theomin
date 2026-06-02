# CHECKLIST GERAL — Implementação do Theomin

> **Última atualização**: 29/05/2026
>
> Este checklist cruza todos os requisitos dos documentos de implementação (00–11) com o código existente no repositório.
> - `[x]` = Implementado e presente no código
> - `[~]` = Parcialmente implementado (funcional mas incompleto vs especificação)
> - `[ ]` = Não implementado

---

## Sprint 1: Fundação e Modelo de Dados
**Referências**: [01-SETUP-E-FUNDACAO.md](./01-SETUP-E-FUNDACAO.md), [02-MODELO-DE-DADOS.md](./02-MODELO-DE-DADOS.md)

### 1.1 Setup do Projeto
- [x] Criar projeto Vite + React + TypeScript
- [x] Instalar todas as dependências (`dexie`, `zustand`, `@dnd-kit/*`, `date-fns`, `lucide-react`, `nanoid`)
- [x] Configurar aliases de path (`vite.config.ts` + `tsconfig.json`)

### 1.2 Design System — Tema Obsidiana
- [x] Criar `src/styles/index.css` com design tokens completos
  - [x] Cores de background (deepest, deep, base, elevated, surface)
  - [x] Cores de borda (subtle, default, strong)
  - [x] Cores de texto (primary, secondary, muted, disabled)
  - [x] Cores de accent (base, hover, active, subtle, glow)
  - [x] Cores semânticas (success, warning, danger, info)
  - [x] Cores de blocos (10 cores para classes)
  - [x] Cores de break/completed
  - [x] Spacing tokens
  - [x] Typography tokens (fontes Inter + JetBrains Mono)
  - [x] Border radius tokens
  - [x] Shadows tokens
  - [x] Transitions tokens
  - [x] Z-index tokens
  - [x] Calendar-specific tokens
  - [x] Sidebar tokens
- [x] Import do Google Fonts (Inter, JetBrains Mono)
- [x] CSS Reset global
- [x] Estilização base de `body`, `a`, `button`, `input`, `select`, `textarea`
- [x] Custom scrollbar (WebKit)
- [x] Utility classes (`.visually-hidden`)
- [x] Keyframe animations (`fadeIn`, `slideUp`, `slideDown`, `scaleIn`, `shimmer`, `pulse-glow`)

### 1.3 Estrutura de Pastas
- [x] `src/components/` (ui, calendar, tasks, classes, availability, overdue)
- [x] `src/engine/`
- [x] `src/stores/`
- [x] `src/db/`
- [x] `src/hooks/`
- [x] `src/types/`
- [x] `src/utils/`
- [x] `src/styles/`
- [x] `src/assets/`

### 1.4 Tipos TypeScript (`src/types/`)
- [x] `task.ts` — `Task`, `TaskId`, `ClassId`, `BlockId`, `Duration`, `TaskStatus`, `RecurrenceType`, `RecurrenceConfig`, `FixedTimeConfig`
- [x] `class.ts` — `TaskClass`
- [x] `availability.ts` — `DayOfWeek`, `TimeSlot`, `WeeklyAvailability`, `AvailabilityException`
- [x] `block.ts` — `BlockStatus`, `ScheduledBlock`, `BreakBlock`
- [x] `overdue.ts` — `OverdueEntry`
- [x] `views.ts` — `ViewType`

### 1.5 Banco de Dados IndexedDB (`src/db/`)
- [x] `database.ts` — `TheominDB` com Dexie.js (tabelas: tasks, classes, availabilityExceptions, blocks, settings)
- [x] `seed.ts` — Dados iniciais (classes padrão + disponibilidade padrão)

### 1.6 Stores Zustand (`src/stores/`)
- [x] `taskStore.ts` — CRUD de tarefas + `setBlocks` + `setOverdue` + `completeBlock`
- [x] `classStore.ts` — CRUD de classes + `reorderClasses`
- [x] `availabilityStore.ts` — Padrão semanal + exceções + `getEffectiveSlots`
- [x] `blockStore.ts` — CRUD de blocos + `moveBlock`
- [x] `calendarStore.ts` — `currentDate`, `viewType`, `goToToday`
  - [ ] `goForward()` e `goBackward()` no store (estão inline no CalendarHeader)

### 1.7 Utilitários de Validação (`src/utils/validation.ts`)
- [x] `timeToMinutes()`
- [x] `minutesToTime()`
- [x] `addMinutesToTime()`
- [x] `isValidDuration()`
- [x] `getDurationOptions()`
- [x] `isValidTimeSlot()`
- [x] `isValidDeadline()`
- [x] `hasCircularDependency()`

### 1.8 Componentes UI Base (`src/components/ui/`)
- [x] `Button.tsx` — Variantes primary, secondary, ghost, danger
- [x] `IconButton.tsx` — Botão circular com ícone
- [x] `Input.tsx` — Campo de texto com label
- [x] `Select.tsx` — Dropdown customizado
- [x] `Modal.tsx` — Overlay com animação
- [x] `Badge.tsx` — Badge numérico
- [x] `Sidebar.tsx` — Navegação lateral colapsável
- [ ] `Tooltip.tsx` — Tooltip posicional
- [ ] `DatePicker.tsx` — Seletor de data customizado (usa `<input type="date">` nativo)
- [ ] `TimePicker.tsx` — Seletor de horário (múltiplos de 15min)
- [ ] `DurationPicker.tsx` como componente UI genérico (existe como componente de tasks)
- [ ] `ColorPicker.tsx` — Seletor de cor para classes
- [ ] `Toast.tsx` — Notificações temporárias

### 1.9 Layout Principal
- [x] App Shell (`App.tsx`) com sidebar + main content
- [x] Troca de views (calendar, tasks, classes, availability, overdue)
- [x] Splash screen (loading enquanto seed roda)
- [x] CSS `.app-shell` e `.app-main`

---

## Sprint 2: Classes + Disponibilidade
**Referências**: [03-SISTEMA-DE-CLASSES.md](./03-SISTEMA-DE-CLASSES.md), [05-DISPONIBILIDADE.md](./05-DISPONIBILIDADE.md)

### 2.1 Sistema de Classes

#### Componentes
- [x] `ClassBoardView.tsx` — Tela completa do quadro de classes
- [x] `PriorityLevel.tsx` — Container de nível de prioridade
- [x] `ClassCard.tsx` — Card de uma classe com drag-and-drop
- [x] `CreateClassModal.tsx` — Modal para criar/editar classe
  - [x] Campo Nome
  - [~] Campo Cor (implementado como select simples, não como seletor visual com bolinhas coloridas)
  - [ ] Campo Ícone (seleção de ícone Lucide — não implementado no modal)

#### Funcionalidades
- [x] Agrupar classes por nível de prioridade
- [x] Drag-and-drop com @dnd-kit (DndContext, SortableContext)
- [x] Reordenação horizontal dentro do nível
- [x] Movimentação vertical entre níveis
- [~] Criação automática de novos níveis ao arrastar entre dois (parcial — lógica presente)
- [x] Remoção de níveis vazios (renumeração sequencial)
- [x] Botão "+ Criar Nova Classe"
- [x] Persistir alterações no IndexedDB
- [x] Estilos tema Obsidiana (inline no index.css)
- [ ] Exclusão de classe com tratamento de tarefas órfãs (modal com opções mover/excluir)

#### Drag-and-Drop
- [x] Configurar DndContext com sensores e collision detection
- [x] Drop zones entre níveis para criar novos níveis
- [x] Visual feedback ao arrastar (drag overlay)

### 2.2 Disponibilidade Semanal

#### Componentes
- [x] `AvailabilityView.tsx` — Tela principal
- [x] `DaySchedule.tsx` — Configuração de um dia da semana
- [x] `TimeSlotRow.tsx` — Uma faixa horária (início–fim)
- [x] `TimeInput.tsx` — Input de horário
- [x] `ExceptionsList.tsx` — Lista de exceções
- [x] `ExceptionModal.tsx` — Modal para criar exceção
- [ ] `WeeklySummary.tsx` — Resumo semanal com total de blocos (componente separado não existe)

#### Funcionalidades
- [x] Configurar múltiplas faixas por dia
- [x] Adicionar/remover faixas horárias
- [~] Cálculo dinâmico de horários de fim válidos (TimeInput com dropdown, mas validação básica)
- [~] Validação de sobreposição de faixas (parcial)
- [x] Exceções por data específica
- [x] Exceção "dia de folga"
- [x] `getEffectiveSlots()` no AvailabilityStore
- [ ] `getAvailableBlockCount()` como função utilitária separada
- [x] Persistir padrão semanal em settings (IndexedDB)
- [x] Persistir exceções na tabela dedicada
- [ ] Limpeza automática de exceções antigas (>30 dias)
- [x] Estilos tema Obsidiana (inline no index.css)

---

## Sprint 3 (doc fala Sprint 5): Gerenciamento de Tarefas
**Referência**: [04-GERENCIAMENTO-TAREFAS.md](./04-GERENCIAMENTO-TAREFAS.md)

### Componentes
- [x] `TaskForm.tsx` — Formulário de criação/edição
- [x] `DurationPicker.tsx` — Seletor de duração (múltiplos de 45min)
- [x] `DependencyPicker.tsx` — Multi-select de dependências
- [ ] `RecurrenceConfig.tsx` — Campos condicionais de recorrência (componente não existe)
- [ ] `FixedTimeConfig.tsx` — Campos condicionais de horário fixo (componente não existe)
- [x] `TaskListView.tsx` — Tela principal da lista de tarefas
- [x] `TaskGroup.tsx` — Agrupamento por deadline
- [x] `TaskCard.tsx` — Card de tarefa na lista
- [x] `ProgressBar.tsx` — Barra de progresso

### Funcionalidades
- [x] Criar tarefa com nome, classe, duração, data de início, deadline
- [x] Criar tarefa com dependências
- [x] Criar tarefa com notas
- [~] Formulário condicional para recorrência (toggle presente no form mas **não funcional** — sem `RecurrenceConfig`)
- [~] Formulário condicional para horário fixo (toggle presente mas **não funcional** — sem `FixedTimeConfig`)
- [x] Edição de tarefas (modal com dados pré-preenchidos)
- [x] Exclusão de tarefas com confirmação
- [ ] Exclusão com tratamento de tarefas dependentes (remover da lista de dependsOn das outras)
- [x] Validação de dependências circulares (`hasCircularDependency` existe no `validation.ts`)
- [x] Lista de tarefas agrupada por deadline
- [x] Labels de urgência (Hoje, Amanhã, Atrasado)
- [x] Botão "+ Nova Tarefa"
- [x] Botão "Recalcular" no header (visual apenas, sem integração no TaskListView)
- [ ] Geração automática de instâncias recorrentes
- [~] Disparar recálculo após criar/editar/excluir (parcial — recálculo automático roda no CalendarView)
- [x] Estilos tema Obsidiana (inline no index.css)

---

## Sprint 4 (doc fala Sprint 3): Motor de Alocação
**Referência**: [06-ALGORITMO-ALOCACAO.md](./06-ALGORITMO-ALOCACAO.md)

### Engine (`src/engine/`)
- [x] `scheduler.ts` — Função principal `runScheduler()`
- [x] `dependency-resolver.ts` — `topologicalSort()` (Kahn's algorithm)
- [x] `break-calculator.ts` — `calculateBreaks()`

### Fases do Algoritmo
- [x] **Fase 1: Preparação** — `generateSlotMap()`
  - [x] Gerar mapa de slots para horizonte de 90 dias
  - [x] Filtrar tarefas ativas
  - [x] Calcular duração restante
  - [x] Separar blocos concluídos e manuais
  - [x] Resolução de dependências (topological sort)
- [x] **Fase 2: Posicionamento de Fixos** — `phase2_placeFixed()`
  - [x] Colocar blocos concluídos
  - [x] Colocar blocos manuais
  - [x] Colocar tarefas de horário fixo
  - [x] Subtrair do slotMap
- [x] **Fase 3: Resolução de Prioridade** — `phase3_prioritize()`
  - [x] Score por classe (priorityLevel × 100 + priorityPosition)
  - [x] Cálculo de urgência (blocos necessários / blocos disponíveis)
  - [x] Threshold de urgência 0.7 (promoção de tarefas com deadline apertado)
  - [x] Respeitar dependências no sort
  - [x] Desempate por deadline
- [x] **Fase 4: Alocação Greedy** — Loop principal
  - [x] `allocateBlocksInDay()` com cálculo de intervalos
  - [x] `findFreeSpaces()` para encontrar espaços livres
  - [x] `getLastBlockBefore()` para calcular intervalos entre tarefas
  - [x] Respeitar data de início efetiva (dependências)
  - [x] Deadline efetivo (dia anterior)
  - [x] Overflow para tarefas que não cabem
  - [x] Subtração dinâmica do slotMap após alocar
- [x] **Fase 5: Detecção de Overflow** — Geração de `OverdueEntry[]`
  - [x] Calcular dias de atraso
  - [x] Ordenar por mais atrasada primeiro

### Intervalos (Breaks)
- [x] Cálculo de breaks de 15min entre blocos consecutivos
- [x] Regras corretas (mesmo dia, gap exato de 15min)

### Triggers de Recálculo
- [x] Recálculo manual (botão 🔄) com `isManualRecalc = true`
- [x] Recálculo automático inicial (quando há tarefas mas sem blocos)
- [x] Recálculo automático ao criar/editar/excluir tarefa (parcial — não está integrado nos stores)
- [x] Virada do dia (hook `useDayChange` existe, mas faz `window.location.reload()` ao invés de lógica completa)
- [x] Marcar blocos não concluídos como `missed` na virada do dia

### Integração
- [x] Integrar scheduler com `taskStore` (`setBlocks`, `setOverdue`)
- [~] Integrar scheduler com `blockStore` (blocks vivem no taskStore, não no blockStore na prática)

### Testes
- [ ] Testes unitários para os 13 cenários críticos
- [ ] Testes de performance com datasets grandes

---

## Sprint 5 (doc fala Sprint 4): Calendário + Progresso
**Referências**: [07-CALENDARIO.md](./07-CALENDARIO.md), [08-PROGRESSO-RECALCULO.md](./08-PROGRESSO-RECALCULO.md)

### 5.1 Calendário — Componentes
- [x] `CalendarView.tsx` — Container com switch semana/dia
- [x] `CalendarHeader.tsx` — Navegação + toggle + botão recalcular
- [x] `WeekView.tsx` — Grid semanal com 7 colunas
- [x] `DayView.tsx` — Grid diário expandido
- [x] `TimeGrid.tsx` — Linhas de hora + posicionamento de blocos
- [x] `TimeGutter.tsx` — Coluna de horas à esquerda
- [x] `DayColumn.tsx` — Coluna de um dia
- [x] `TaskBlock.tsx` — Bloco de tarefa com cor, nome, meta
- [x] `BreakBlock.tsx` — Intervalo cinza transparente
- [x] `NowIndicator.tsx` — Linha vermelha "agora"
- [x] `CalendarView.css` — Estilos completos

### 5.2 Calendário — Funcionalidades
- [x] Cálculo de posição (`timeToPixels`)
- [x] Navegação (forward, backward, today)
- [x] Troca seamless semana ↔ dia
- [x] Clique no número do dia → visão diária
- [ ] Drag-and-drop de blocos no calendário para reorganização manual
- [~] Scroll automático para horário atual (parcial — lógica básica)
- [x] Botão de completar bloco no hover
- [x] Blocos concluídos com opacidade reduzida
- [x] Indicador de horário fixo (📌)
- [ ] Responsividade (mobile → forçar dia, breakpoints)

### 5.3 Progresso e Recálculo
- [x] `completeBlock()` — Marcar bloco como concluído (no taskStore)
- [x] `completeBlock()` completo com atualização de `completedDuration` da tarefa no IndexedDB
- [x] `uncompleteBlock()` — Desfazer conclusão de bloco
- [x] `ProgressBar.tsx` — Barra de progresso visual
- [x] Detecção de virada de dia (`useDayChange` hook)
- [x] Marcação de blocos `missed` na virada do dia
- [x] Trigger de recálculo manual (`isManualRecalc = true`)
- [ ] Drag-and-drop de blocos com `isManuallyPlaced`
- [ ] Validação de drop (sem sobreposição, não no passado)
- [ ] Filtragem de blocos em dias passados (só concluídos)
- [ ] Verificação de dependências desbloqueadas ao completar tarefa
- [ ] Feedback visual completo (toasts, animações de conclusão)
- [ ] Indicador visual de bloco manual (borda pontilhada)

---

## Sprint 6: Atrasadas + Integração + Polish
**Referências**: [09-SISTEMA-ATRASADAS.md](./09-SISTEMA-ATRASADAS.md), [10-INTEGRACAO-POLISH.md](./10-INTEGRACAO-POLISH.md)

### 6.1 Sistema de Atrasadas

#### Componentes
- [x] `OverduePanel.tsx` — Tela principal com lista e resumo
- [x] `OverdueCard.tsx` — Card com severidade visual e ações
- [x] `OverdueSummary.tsx` — Tempo total + estimativa de recuperação
- [ ] `OverdueBadge.tsx` — Badge separado para sidebar (badge está inline na Sidebar)
- [x] `OverduePanel.css` — Estilos

#### Funcionalidades
- [x] Detecção de overflow pelo engine (Fase 5 do scheduler)
- [x] Exibição de severidade (critical/warning/mild)
- [x] Ação "Adiar deadline" (via `prompt()` — básico)
- [x] Ação "Encaixar na agenda" (extensão de deadline em +30 dias)
- [x] Indicador de overflow parcial
- [x] Indicador de dependências bloqueadas
- [~] Badge na sidebar (contagem de overdue presente, sem animação pulse separada)
- [~] Notificação quando novas atrasadas aparecem (não implementada como componente flutuante)
- [ ] `detectOverdueTasks()` como função separada no engine (lógica está embutida no scheduler)
- [~] Modal adequado para adiar deadline (usa `prompt()` nativo ao invés de modal customizado)

### 6.2 Integração

- [x] Fluxo de boot com seed database
- [x] Splash screen (THEOMIN com animação)
- [x] Seed database para primeiro acesso
- [ ] Onboarding (wizard 3 passos)
- [ ] Tratar edge case: sem disponibilidade (aviso + bloqueio)
- [ ] Tratar edge case: prazo impossível (aviso ao criar tarefa)
- [~] Tratar edge case: dependência circular (validação existe no `validation.ts`, mas não integrada no form visualmente)
- [ ] Tratar edge case: exclusão de classe com tarefas (modal com opções)
- [ ] Tratar edge case: conflito de blocos manuais (feedback visual)

### 6.3 Polish

- [x] Atalhos de teclado básicos (`t` = hoje, `1` = dia, `2` = semana)
- [ ] Atalhos completos (`N` = nova tarefa, `R` = recalcular, `←/→` = navegar, `Esc` = fechar modal, `?` = overlay)
- [ ] Overlay de atalhos (pressionar `?`)
- [ ] Micro-animações de conclusão de bloco
- [ ] Micro-animação de conclusão de tarefa (confetti)
- [ ] Animação de recálculo (shimmer)
- [ ] Transições de troca de view (fadeIn/slideUp)
- [~] Animações de drag-and-drop (estilos CSS existem no `index.css`, mas drag no calendário não está implementado)
- [ ] Debounce no recálculo
- [ ] Error Boundary global
- [ ] Tratamento de erros do IndexedDB (fallback)
- [ ] Acessibilidade — contraste WCAG AA
- [ ] Acessibilidade — focus visible customizado
- [ ] Acessibilidade — aria labels em botões de ícone
- [ ] Acessibilidade — roles no calendário (`role="grid"`, `role="gridcell"`)
- [ ] Performance — `React.memo` em `TaskBlock` e `DayColumn`
- [ ] Performance — seletores Zustand granulares
- [ ] Performance — transações batch ao salvar blocos
- [ ] Teste de integração completo end-to-end

---

## Sprint 7: Compromissos Importantes
**Referência**: [12-COMPROMISSOS-IMPORTANTES.md](./12-COMPROMISSOS-IMPORTANTES.md)

### 7.1 Modelo de Dados
- [ ] Criar `src/types/commitment.ts` com tipo `Commitment` e `CommitmentId`
- [ ] Atualizar `src/db/database.ts` — adicionar tabela `commitments` na versão 2 do schema
- [ ] Criar `src/stores/commitmentStore.ts` com CRUD + queries

### 7.2 Componentes
- [ ] Criar `src/components/commitments/CommitmentsPanel.tsx` — painel principal
- [ ] Criar `src/components/commitments/CommitmentItem.tsx` — item individual
- [ ] Criar `src/components/commitments/CommitmentForm.tsx` — form inline
- [ ] Criar `src/components/commitments/CommitmentsPanel.css` — estilos tema Obsidiana

### 7.3 Integração
- [ ] Modificar `src/components/ui/Sidebar.tsx` — renderizar `CommitmentsPanel` abaixo dos nav items
- [ ] Ajustar CSS da sidebar para layout flex column correto
- [ ] Modificar `src/App.tsx` — carregar `commitmentStore` no boot

### 7.4 Funcionalidades
- [ ] Criação inline (form ao clicar `+`, Enter/✓ confirma, Escape/✕ cancela)
- [ ] Conclusão via checkbox toggle
- [ ] Exclusão via botão delete no hover
- [ ] Ordenação por data mais próxima primeiro
- [ ] Indicadores visuais de urgência (overdue, today, urgent)
- [ ] Labels inteligentes de data (Hoje, Amanhã, em Xd, dd/MM)


---

## Resumo Geral por Área

| Área | Total | Feito | Parcial | Faltando |
|------|-------|-------|---------|----------|
| **Setup & Fundação** | 35 | 33 | 0 | 2 |
| **Design System (Tema)** | 22 | 22 | 0 | 0 |
| **Tipos TypeScript** | 6 | 6 | 0 | 0 |
| **Banco de Dados** | 2 | 2 | 0 | 0 |
| **Stores Zustand** | 6 | 5 | 0 | 1 |
| **Validação/Utils** | 8 | 8 | 0 | 0 |
| **Componentes UI Base** | 13 | 7 | 0 | 6 |
| **Sistema de Classes** | 14 | 11 | 2 | 1 |
| **Disponibilidade** | 16 | 10 | 2 | 4 |
| **Gerenciamento Tarefas** | 18 | 11 | 3 | 4 |
| **Motor de Alocação** | 22 | 19 | 2 | 1 |
| **Calendário** | 14 | 11 | 1 | 2 |
| **Progresso/Recálculo** | 14 | 4 | 0 | 10 |
| **Sistema Atrasadas** | 11 | 6 | 4 | 1 |
| **Integração** | 9 | 3 | 1 | 5 |
| **Polish** | 18 | 1 | 1 | 16 |
| **Compromissos Importantes** | 16 | 0 | 0 | 16 |
| **TOTAL** | **244** | **159** | **16** | **69** |

---

## Prioridades de Implementação Pendente

### 🔴 Alta Prioridade (funcionalidade core faltando)
1. ~~`completeBlock()` com atualização de `completedDuration` no IndexedDB~~ (FEITO)
2. ~~Recálculo automático ao criar/editar/excluir tarefa (integração nos stores)~~ (FEITO)
3. ~~Virada do dia completa (marcar blocos `missed`, recalcular)~~ (FEITO)
4. `RecurrenceConfig.tsx` e `FixedTimeConfig.tsx` (formulários condicionais)
5. Exclusão de tarefa com tratamento de dependências
6. Exclusão de classe com tratamento de tarefas órfãs
7. ~~`uncompleteBlock()` (desfazer conclusão)~~ (FEITO)

### 🟡 Média Prioridade (UX/completude)
8. Drag-and-drop de blocos no calendário
9. Onboarding (wizard de primeiro acesso)
10. Toast system para feedback visual
11. Modal adequado para "Adiar deadline" (substituir `prompt()`)
12. Atalhos de teclado completos
13. Responsividade (mobile)
14. Filtrar blocos em dias passados (só mostrar concluídos)
15. Geração de instâncias recorrentes

### 🟢 Baixa Prioridade (polish e extras)
16. Componentes UI faltantes (Tooltip, ColorPicker, DatePicker, TimePicker)
17. Micro-animações (confetti, shimmer, transitions)
18. Error Boundary
19. Acessibilidade completa
20. Performance optimizations (React.memo, seletores granulares)
21. Overlay de atalhos
22. Debounce no recálculo
23. Limpeza de exceções antigas
24. Testes unitários e de integração
