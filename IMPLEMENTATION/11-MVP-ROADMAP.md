# 11 — MVP Roadmap

Este documento define a **ordem de implementação**, o escopo exato do MVP, e o roadmap de features pós-MVP.

---

## 11.1 Ordem de Implementação (Sprints)

A implementação está dividida em **6 sprints**. Cada sprint produz algo funcional e testável.

---

### Sprint 1: Fundação e Modelo de Dados
**Referência**: Docs [01](./01-SETUP-E-FUNDACAO.md) e [02](./02-MODELO-DE-DADOS.md)

| # | Tarefa | Prioridade |
|---|---|---|
| 1.1 | Criar projeto Vite + React + TypeScript | 🔴 |
| 1.2 | Instalar todas as dependências | 🔴 |
| 1.3 | Configurar aliases de path | 🟡 |
| 1.4 | Criar `src/styles/index.css` com design tokens do tema Obsidiana | 🔴 |
| 1.5 | Criar todos os tipos TypeScript (`src/types/`) | 🔴 |
| 1.6 | Configurar Dexie.js com schema IndexedDB | 🔴 |
| 1.7 | Criar seed data | 🟡 |
| 1.8 | Criar stores Zustand (task, class, availability, block, calendar) | 🔴 |
| 1.9 | Criar utilitários de validação | 🔴 |
| 1.10 | Criar componentes UI base (Button, Input, Modal, Select, Badge) | 🔴 |
| 1.11 | Criar Sidebar com navegação | 🔴 |
| 1.12 | Criar App shell com troca de views | 🔴 |

**Entregável**: App abre com sidebar funcional, tema obsidiana aplicado, banco de dados criado.

---

### Sprint 2: Classes + Disponibilidade
**Referência**: Docs [03](./03-SISTEMA-DE-CLASSES.md) e [05](./05-DISPONIBILIDADE.md)

| # | Tarefa | Prioridade |
|---|---|---|
| 2.1 | Implementar `ClassBoardView` (quadro Kanban) | 🔴 |
| 2.2 | Implementar `ClassCard` com drag-and-drop | 🔴 |
| 2.3 | Implementar `PriorityLevel` (linhas de prioridade) | 🔴 |
| 2.4 | Implementar `CreateClassModal` (CRUD de classes) | 🔴 |
| 2.5 | Implementar reordenação com @dnd-kit | 🔴 |
| 2.6 | Implementar `AvailabilityView` (padrão semanal) | 🔴 |
| 2.7 | Implementar `DaySchedule` + `TimeSlotRow` | 🔴 |
| 2.8 | Implementar `TimeInput` com validação de múltiplos | 🔴 |
| 2.9 | Implementar `WeeklySummary` | 🟡 |
| 2.10 | Implementar `ExceptionModal` + `ExceptionsList` | 🟡 |
| 2.11 | Persistir classes e disponibilidade no IndexedDB | 🔴 |

**Entregável**: Usuário pode criar/organizar classes por prioridade e configurar horários disponíveis.

---

### Sprint 3: Tarefas (CRUD básico)
**Referência**: Doc [04](./04-GERENCIAMENTO-TAREFAS.md)

| # | Tarefa | Prioridade |
|---|---|---|
| 3.1 | Implementar `TaskForm` (formulário de criação) | 🔴 |
| 3.2 | Implementar `DurationPicker` (múltiplos de 45min) | 🔴 |
| 3.3 | Implementar `DatePicker` simples | 🔴 |
| 3.4 | Implementar `TaskListView` (lista estilo Google Tasks) | 🔴 |
| 3.5 | Implementar `TaskCard` com metadados | 🔴 |
| 3.6 | Implementar `TaskGroup` (agrupamento por deadline) | 🔴 |
| 3.7 | Implementar `ProgressBar` | 🟡 |
| 3.8 | Implementar edição de tarefas | 🔴 |
| 3.9 | Implementar exclusão com confirmação | 🔴 |
| 3.10 | Implementar `DependencyPicker` (multi-select) | 🔴 |
| 3.11 | Implementar validação de dependência circular | 🔴 |
| 3.12 | Implementar `RecurrenceConfig` (config de recorrência) | 🟡 |
| 3.13 | Implementar `FixedTimeConfig` (horário fixo) | 🟡 |

**Entregável**: Usuário pode criar, editar, excluir tarefas com todos os parâmetros. Lista de tarefas funcional.

---

### Sprint 4: Algoritmo de Alocação
**Referência**: Doc [06](./06-ALGORITMO-ALOCACAO.md)

| # | Tarefa | Prioridade |
|---|---|---|
| 4.1 | Implementar `generateSlotMap()` (Fase 1) | 🔴 |
| 4.2 | Implementar `placeFixedBlocks()` (Fase 2) | 🔴 |
| 4.3 | Implementar `topologicalSort()` (dependências) | 🔴 |
| 4.4 | Implementar `prioritizeTasks()` com urgência (Fase 3) | 🔴 |
| 4.5 | Implementar `allocateBlocks()` greedy (Fase 4) | 🔴 |
| 4.6 | Implementar `allocateBlocksInDay()` com intervalos | 🔴 |
| 4.7 | Implementar `detectOverflow()` (Fase 5) | 🔴 |
| 4.8 | Implementar `calculateBreaks()` | 🔴 |
| 4.9 | Integrar scheduler com stores | 🔴 |
| 4.10 | Implementar triggers de recálculo (automáticos) | 🔴 |
| 4.11 | Implementar geração de instâncias recorrentes | 🟡 |
| 4.12 | Testar cenários críticos (13 cenários do doc 06) | 🔴 |

**Entregável**: Ao criar tarefas, blocos são automaticamente alocados. Sistema de prioridade funcional.

---

### Sprint 5: Calendário + Progresso
**Referência**: Docs [07](./07-CALENDARIO.md) e [08](./08-PROGRESSO-RECALCULO.md)

| # | Tarefa | Prioridade |
|---|---|---|
| 5.1 | Implementar `CalendarHeader` (nav + toggle) | 🔴 |
| 5.2 | Implementar `TimeGutter` (coluna de horas) | 🔴 |
| 5.3 | Implementar `TimeGrid` (grid temporal) | 🔴 |
| 5.4 | Implementar `WeekView` (visão semanal) | 🔴 |
| 5.5 | Implementar `DayView` (visão diária) | 🔴 |
| 5.6 | Implementar `TaskBlock` (bloco de 45min) | 🔴 |
| 5.7 | Implementar `BreakBlock` (intervalo de 15min) | 🔴 |
| 5.8 | Implementar `NowIndicator` (linha "agora") | 🟡 |
| 5.9 | Implementar troca seamless semana ↔ dia | 🔴 |
| 5.10 | Implementar navegação (←, →, Hoje) | 🔴 |
| 5.11 | Implementar clique no dia → visão diária | 🟡 |
| 5.12 | Implementar conclusão de bloco (botão ✓) | 🔴 |
| 5.13 | Implementar visual de bloco concluído (opacidade) | 🔴 |
| 5.14 | Implementar drag-and-drop de blocos | 🟡 |
| 5.15 | Implementar blocos manuais (isManuallyPlaced) | 🟡 |
| 5.16 | Implementar botão Recalcular (manual) | 🔴 |
| 5.17 | Implementar detecção de virada de dia | 🔴 |
| 5.18 | Implementar filtragem de dias passados | 🔴 |
| 5.19 | Scroll automático para horário atual | 🟡 |

**Entregável**: Calendário completo e funcional. Usuário vê blocos, marca como concluídos, navega entre dias/semanas.

---

### Sprint 6: Atrasadas + Integração + Polish
**Referência**: Docs [09](./09-SISTEMA-ATRASADAS.md) e [10](./10-INTEGRACAO-POLISH.md)

| # | Tarefa | Prioridade |
|---|---|---|
| 6.1 | Implementar `OverduePanel` | 🔴 |
| 6.2 | Implementar `OverdueCard` com severidade | 🔴 |
| 6.3 | Implementar `OverdueSummary` (tempo total + estimativa) | 🔴 |
| 6.4 | Implementar badge de atrasadas na sidebar | 🔴 |
| 6.5 | Implementar ação "Adiar deadline" | 🔴 |
| 6.6 | Implementar ação "Encaixar na agenda" | 🟡 |
| 6.7 | Implementar notificação de novas atrasadas | 🟡 |
| 6.8 | Implementar onboarding (wizard 3 passos) | 🟡 |
| 6.9 | Implementar atalhos de teclado | 🟡 |
| 6.10 | Implementar micro-animações (conclusão, recálculo, drag) | 🟡 |
| 6.11 | Implementar splash screen | 🟢 |
| 6.12 | Implementar Error Boundary | 🟡 |
| 6.13 | Verificar acessibilidade | 🟡 |
| 6.14 | Teste de integração completo end-to-end | 🔴 |
| 6.15 | Bug fixing e polish | 🔴 |

**Entregável**: MVP completo. Todas as features funcionando integradas.

---

## 11.2 Definição de "MVP Pronto"

O MVP está pronto quando o usuário pode:

- [x] Abrir o app e ver o calendário
- [x] Criar classes de atividade e organizar por prioridade
- [x] Configurar horários disponíveis por dia da semana
- [x] Criar tarefas com nome, duração, prazo, classe
- [x] Criar tarefas com dependências
- [x] Criar tarefas recorrentes e de horário fixo
- [x] Ver blocos auto-alocados no calendário semanal e diário
- [x] Marcar blocos como concluídos
- [x] Ver tarefas atrasadas no painel dedicado
- [x] Adiar deadline de atrasadas
- [x] Reorganizar blocos manualmente no calendário
- [x] Recalcular agenda manualmente
- [x] Ver lista de tarefas (estilo Google Tasks)
- [x] Navegar por dias/semanas passadas e futuras
- [x] Ter dados persistidos localmente (não perder ao fechar)
- [x] Tema escuro obsidiana impecável

---

## 11.3 Roadmap Pós-MVP

### Fase 2: Produtividade e Insights

| Feature | Descrição |
|---|---|
| Dashboard | Visão de produtividade: % concluído na semana, por classe, streaks |
| Gráficos | Gráfico de barras: horas trabalhadas por classe por semana |
| Histórico | Timeline de tarefas concluídas |
| Relatórios | Exportar relatório semanal/mensal (PDF ou MD) |

### Fase 3: Sincronização

| Feature | Descrição |
|---|---|
| Contas | Login com Google/email |
| Cloud sync | Sincronização via Supabase ou Firebase |
| Multi-device | Usar em vários dispositivos |
| Compartilhar | Compartilhar agenda com alguém |

### Fase 4: Integrações

| Feature | Descrição |
|---|---|
| Google Calendar | Importar/exportar eventos |
| Google Tasks | Importar tarefas existentes |
| Notion | Sync bidirecional de tarefas |
| Webhooks | Integrações customizadas |

### Fase 5: Mobile

| Feature | Descrição |
|---|---|
| PWA | Progressive Web App (funciona offline, instala no celular) |
| Push notifications | "Seu próximo bloco começa em 5 minutos!" |
| Widget | Widget de "próxima tarefa" no celular |

### Fase 6: Inteligência

| Feature | Descrição |
|---|---|
| ML | Aprender quanto tempo o usuário realmente leva vs estimado |
| Smart scheduling | Sugerir melhores horários baseado em padrões |
| Predição de atraso | Alertar proativamente quando detectar que vai atrasar |
| Natural language | "Criar tarefa: estudar cálculo, 3 blocos, até sexta" |

---

## 11.4 Estimativa de Tempo

### Por sprint (estimativa conservadora)

| Sprint | Escopo | Tempo estimado |
|---|---|---|
| Sprint 1 | Fundação | 2-3 dias |
| Sprint 2 | Classes + Disponibilidade | 3-4 dias |
| Sprint 3 | Tarefas CRUD | 3-4 dias |
| Sprint 4 | Algoritmo | 4-5 dias |
| Sprint 5 | Calendário + Progresso | 5-6 dias |
| Sprint 6 | Atrasadas + Polish | 3-4 dias |
| **Total** | **MVP** | **~20-26 dias** |

Nota: estes tempos assumem trabalho focado. O Sprint 4 (algoritmo) é o mais complexo e pode levar mais se houver bugs na lógica de priorização.

---

## 11.5 Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Algoritmo com bugs de priorização | Alta | Alto | Testes extensivos com cenários reais |
| Performance com muitas tarefas | Baixa | Médio | Debounce + profiling |
| Drag-and-drop no calendário complexo | Média | Médio | @dnd-kit tem boa documentação |
| IndexedDB não suportado (modo privado) | Baixa | Alto | Fallback para localStorage |
| Conflitos de recálculo (múltiplas abas) | Média | Baixo | Usar navigator.locks |
| Cálculo de intervalos complicado | Média | Médio | Testes unitários específicos |

---

## 11.6 Árvore de Documentos

```
IMPLEMENTATION/
├── 00-VISAO-GERAL.md              ← Visão, arquitetura, stack
├── 01-SETUP-E-FUNDACAO.md         ← Setup, tema, componentes base
├── 02-MODELO-DE-DADOS.md          ← Tipos, schema, stores
├── 03-SISTEMA-DE-CLASSES.md       ← Classes + Kanban de prioridade
├── 04-GERENCIAMENTO-TAREFAS.md    ← CRUD tarefas + dependências
├── 05-DISPONIBILIDADE.md          ← Disponibilidade semanal
├── 06-ALGORITMO-ALOCACAO.md       ← Motor de scheduling (5 fases)
├── 07-CALENDARIO.md               ← Calendar UI (semana + dia)
├── 08-PROGRESSO-RECALCULO.md      ← Progresso + recálculo
├── 09-SISTEMA-ATRASADAS.md        ← Painel de atrasadas
├── 10-INTEGRACAO-POLISH.md        ← Edge cases + polish
├── 11-MVP-ROADMAP.md              ← Este documento
└── 12-COMPROMISSOS-IMPORTANTES.md ← Compromissos importantes (sidebar)
```

---

## Pronto para começar! 🚀

Com estes 12 documentos, temos um mapa completo do que precisa ser implementado. A sugestão é começar pelo **Sprint 1** e seguir em ordem, sempre testando ao final de cada sprint.

Boa construção, Theomin.
