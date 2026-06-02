# 04 — Gerenciamento de Tarefas

Este documento cobre o CRUD de tarefas, a lista de tarefas (estilo Google Tasks), dependências e tarefas recorrentes.

---

## 4.1 Criação de Tarefas

### Modal de Criação

```
┌─────────────────────────────────────────────────┐
│  ✕                                               │
│                                                  │
│  Nova Tarefa                                     │
│                                                  │
│  Nome da tarefa                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ Estudar Cálculo III - Capítulo 5           │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌─────────────────┐  ┌─────────────────────┐   │
│  │ Classe           │  │ Duração             │   │
│  │ ▼ Faculdade 🟣  │  │ ▼ 2h45 (3 blocos)  │   │
│  └─────────────────┘  └─────────────────────┘   │
│                                                  │
│  ┌─────────────────┐  ┌─────────────────────┐   │
│  │ Data de início   │  │ Prazo (deadline)     │   │
│  │ 📅 28/05/2026   │  │ 📅 04/06/2026       │   │
│  └─────────────────┘  └─────────────────────┘   │
│                                                  │
│  ☐ Tarefa recorrente                             │
│  ☐ Horário fixo                                  │
│                                                  │
│  Depende de (opcional)                           │
│  ┌────────────────────────────────────────────┐  │
│  │ 🔍 Buscar tarefa...                        │  │
│  │ ┌──────────────────────────────────────┐   │  │
│  │ │ ✕ Ler capítulo 4 de Cálculo         │   │  │
│  │ └──────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  Notas (opcional)                                │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌────────────┐                ┌──────────────┐  │
│  │  Cancelar  │                │ Criar Tarefa │  │
│  └────────────┘                └──────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Campos do formulário

| Campo | Tipo | Obrigatório | Default | Validação |
|---|---|---|---|---|
| Nome | Texto | Sim | — | 1-200 caracteres |
| Classe | Select | Sim | Primeira classe | Classe existente |
| Duração | DurationPicker | Sim | 45min | Múltiplos de 45min |
| Data de início | DatePicker | Sim | Hoje | ≥ hoje |
| Deadline | DatePicker | Sim | — | > data de início |
| Recorrente | Toggle | Não | false | — |
| Horário fixo | Toggle | Não | false | — |
| Depende de | Multi-select | Não | [] | Sem dependência circular |
| Notas | Textarea | Não | — | Até 1000 chars |

### DurationPicker — Seletor de Duração

O seletor mostra as opções de duração e quantos blocos de 45min representam:

```
┌───────────────────────────────┐
│  ▼ Duração                    │
├───────────────────────────────┤
│    45min    (1 bloco)    ●    │
│    1h45     (2 blocos)       │
│    2h45     (3 blocos)       │
│    3h45     (4 blocos)       │
│    4h45     (5 blocos)       │
│    5h45     (6 blocos)       │
│    ...                       │
│    11h45    (12 blocos)      │
└───────────────────────────────┘
```

**Nota sobre a lógica do DurationPicker:**

A duração armazenada é sempre o tempo de trabalho puro (múltiplos de 45min). Os intervalos de 15min são calculados automaticamente pelo algoritmo de alocação ao posicionar os blocos no calendário. Então:

- Usuário seleciona "2h45" → armazenado como `totalDuration: 135` (3 × 45min)
- No calendário, se os 3 blocos forem consecutivos, ocuparão: 45 + 15 + 45 + 15 + 45 = **2h45** de espaço visual

---

## 4.2 Formulário Condicional: Recorrência

Quando o toggle "Tarefa recorrente" é ativado, campos adicionais aparecem:

```
┌─────────────────────────────────────────────┐
│  ☑ Tarefa recorrente                         │
│                                              │
│  Frequência                                  │
│  ┌──────────────────────┐                    │
│  │ ▼ Semanal            │                    │
│  └──────────────────────┘                    │
│                                              │
│  Dias da semana                              │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ D │ │ S │ │ T │ │ Q │ │ Q │ │ S │ │ S ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│   ○     ●     ○     ●     ○     ●     ○    │
│                                              │
│  Data de fim (opcional)                      │
│  ┌──────────────────────┐                    │
│  │ 📅 Sem data de fim   │                    │
│  └──────────────────────┘                    │
└─────────────────────────────────────────────┘
```

### Tipos de recorrência

| Tipo | Descrição | Campos extras |
|---|---|---|
| `daily` | Todo dia | Nenhum |
| `weekly` | Semanalmente | Dias da semana |
| `biweekly` | Quinzenalmente | Dias da semana |
| `monthly` | Mensalmente | Dia do mês |

### Como tarefas recorrentes são agendadas

1. **Geração de instâncias**: O sistema gera instâncias da tarefa para cada ocorrência futura (horizon de 30 dias)
2. Cada instância é uma tarefa regular com seu próprio prazo (final do dia)
3. Recorrências são regeneradas conforme os dias passam

---

## 4.3 Formulário Condicional: Horário Fixo

Quando "Horário fixo" é ativado:

```
┌─────────────────────────────────────────────┐
│  ☑ Horário fixo                              │
│                                              │
│  Horário de início                           │
│  ┌──────────────────────┐                    │
│  │ ⏰ 14:00             │                    │
│  └──────────────────────┘                    │
│                                              │
│  Dias da semana                              │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐│
│  │ D │ │ S │ │ T │ │ Q │ │ Q │ │ S │ │ S ││
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘│
│   ○     ●     ●     ●     ●     ●     ○    │
│                                              │
│  ⚠ Esta tarefa será agendada                │
│  independentemente do seu tempo livre.        │
└─────────────────────────────────────────────┘
```

**Tarefas de horário fixo:**
- São alocadas no calendário no horário especificado, independente da disponibilidade
- Reduzem o tempo disponível para outras tarefas naquele horário
- Não são movidas pelo algoritmo de recálculo
- Exemplos: aulas, reuniões, treino na academia

---

## 4.4 Dependências entre Tarefas

### Interface de seleção

O campo "Depende de" funciona como um multi-select com busca:

```typescript
// Filtrar tarefas elegíveis para dependência
function getEligibleDependencies(currentTaskId: TaskId, allTasks: Task[]): Task[] {
  return allTasks.filter(task => {
    // Não pode depender de si mesma
    if (task.id === currentTaskId) return false;
    
    // Não pode criar dependência circular
    if (hasCircularDependency(currentTaskId, [task.id], allTasks)) return false;
    
    // Não pode depender de tarefa já concluída (não faz sentido)
    if (task.status === 'completed') return false;
    
    return true;
  });
}
```

### Impacto no agendamento

Quando Tarefa B depende de Tarefa A:

1. **B só pode ser agendada após o último bloco de A** (+ intervalo de 15min se consecutivo)
2. **Se A é grande demais** e seu último bloco estimado ultrapassa o deadline de B:
   - Calcular quanto tempo de B "não cabe" antes do deadline
   - Esse tempo de B vai para "atrasadas"
   - O tempo que cabe é agendado normalmente
3. **Se A está atrasada**, B automaticamente fica atrasada na parte que não pode ser cumprida

### Visualização de dependências

Na Task List, tarefas com dependências mostram um indicador:

```
┌─────────────────────────────────────┐
│ 🔗 Estudar Cap. 5 (depende de:     │
│    "Ler Cap. 4")                    │
│    ⏱ 2h45  📅 04/06               │
└─────────────────────────────────────┘
```

---

## 4.5 Task List View (Estilo Google Tasks)

A tela de tarefas mostra todas as tarefas em uma lista vertical, ordenada por deadline.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Tarefas                              🔄 Recalcular      │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  📅 Vence em 29/05 (amanhã)                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ○  Revisar apresentação TCC                        │  │
│  │    🟣 Faculdade  ·  ⏱ 1h45  ·  ██████░░ 67%      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📅 Vence em 02/06                                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ○  Preparar relatório mensal                       │  │
│  │    🔵 Trabalho  ·  ⏱ 3h45  ·  ░░░░░░░░ 0%        │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ○  Estudar Cálculo III - Cap 5                     │  │
│  │    🟣 Faculdade  ·  ⏱ 2h45  ·  ░░░░░░░░ 0%        │  │
│  │    🔗 Depende de: Ler Cap 4                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📅 Vence em 10/06                                      │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ○  Entregar projeto de Controle                    │  │
│  │    🟣 Faculdade  ·  ⏱ 5h45  ·  ███░░░░░ 33%      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  + Nova Tarefa                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Componentes

```
src/components/tasks/
├── TaskListView.tsx         # Tela completa da lista
├── TaskGroup.tsx            # Grupo por deadline
├── TaskCard.tsx             # Card de uma tarefa na lista
├── TaskForm.tsx             # Formulário de criação/edição
├── DurationPicker.tsx       # Seletor de duração
├── DependencyPicker.tsx     # Multi-select de dependências
├── RecurrenceConfig.tsx     # Config de recorrência
├── FixedTimeConfig.tsx      # Config de horário fixo
├── ProgressBar.tsx          # Barra de progresso da tarefa
└── TaskListView.css         # Estilos
```

### TaskCard — Informações exibidas

| Elemento | Descrição |
|---|---|
| Checkbox | Marcar tarefa como concluída (só se 100% dos blocos foram feitos) |
| Nome | Nome da tarefa |
| Classe badge | Cor + nome da classe |
| Duração | Tempo total (ex: "2h45") |
| Barra de progresso | % de blocos concluídos |
| Dependência | Indicador "🔗 Depende de: X" se houver |
| Ícone recorrente | 🔄 se é recorrente |
| Ícone fixo | 📌 se tem horário fixo |

### Interações

| Ação | Comportamento |
|---|---|
| Clicar no card | Expandir/abrir para edição |
| Clicar no checkbox | Só funciona se todos os blocos foram concluídos; completa a tarefa |
| Botão 🔄 Recalcular | Dispara recálculo manual do algoritmo de alocação |
| Botão + Nova Tarefa | Abre modal de criação |
| Swipe ou botão delete | Exclui tarefa (com confirmação) |

---

## 4.6 Edição de Tarefas

Ao clicar em um TaskCard, o card se expande para mostrar o formulário de edição inline ou abre um modal (mesmo formulário da criação, mas pré-preenchido).

### Campos editáveis pós-criação

| Campo | Editável? | Notas |
|---|---|---|
| Nome | ✅ Sim | — |
| Classe | ✅ Sim | Muda prioridade da tarefa |
| Duração | ✅ Sim | Se diminuir, remove blocos excedentes. Se aumentar, marca como `pending` novamente |
| Data de início | ✅ Sim | Não pode ser anterior a hoje |
| Deadline | ✅ Sim | Deve ser > data de início |
| Dependências | ✅ Sim | Verificar ciclos |
| Recorrência | ✅ Sim | — |
| Horário fixo | ✅ Sim | — |
| Notas | ✅ Sim | — |

### Após edição

1. Atualizar tarefa no IndexedDB
2. Verificar se a edição afeta a alocação (ex: mudou deadline, duração ou classe)
3. Se afeta: **disparar recálculo automático**
4. Atualizar UI

---

## 4.7 Exclusão de Tarefas

```typescript
async function deleteTask(taskId: TaskId) {
  // 1. Verificar se outras tarefas dependem desta
  const dependentTasks = tasks.filter(t => t.dependsOn.includes(taskId));
  
  if (dependentTasks.length > 0) {
    // Mostrar modal: "As seguintes tarefas dependem desta: [lista]"
    // Opções: "Remover dependência e excluir" ou "Cancelar"
    const confirmed = await showConfirmation(dependentTasks);
    if (!confirmed) return;
    
    // Remover esta tarefa da lista de dependências das outras
    for (const dep of dependentTasks) {
      await updateTask(dep.id, {
        dependsOn: dep.dependsOn.filter(id => id !== taskId)
      });
    }
  }
  
  // 2. Remover todos os blocos agendados desta tarefa
  await db.blocks.where('taskId').equals(taskId).delete();
  
  // 3. Remover a tarefa
  await db.tasks.delete(taskId);
  
  // 4. Disparar recálculo
  await recalculate();
}
```

---

## 4.8 Estilos da Task List (Tema Obsidiana)

```css
/* src/components/tasks/TaskListView.css */

.task-list {
  max-width: 700px;
  margin: 0 auto;
}

.task-list__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2xl);
}

.task-list__header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
}

/* ===== TASK GROUP ===== */
.task-group {
  margin-bottom: var(--space-xl);
}

.task-group__date {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-sm);
  padding-left: var(--space-sm);
}

.task-group__date--urgent {
  color: var(--color-warning);
}

.task-group__date--overdue {
  color: var(--color-danger);
}

/* ===== TASK CARD ===== */
.task-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
  margin-bottom: 1px;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.task-card:hover {
  background: var(--bg-elevated);
  border-color: var(--border-default);
}

.task-card:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.task-card:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.task-card:only-child {
  border-radius: var(--radius-md);
}

/* Checkbox */
.task-card__checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-strong);
  border-radius: var(--radius-full);
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-card__checkbox:hover {
  border-color: var(--accent-base);
}

.task-card__checkbox--completed {
  background: var(--color-success);
  border-color: var(--color-success);
}

/* Conteúdo */
.task-card__content {
  flex: 1;
  min-width: 0;
}

.task-card__name {
  font-weight: var(--weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-xs);
}

.task-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.task-card__class-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  background: var(--accent-subtle);
}

.task-card__separator {
  color: var(--text-muted);
}

/* Barra de progresso */
.task-card__progress {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.progress-bar {
  width: 80px;
  height: 4px;
  background: var(--bg-surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: var(--accent-base);
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
}

.progress-bar__fill--complete {
  background: var(--color-success);
}

/* Dependência */
.task-card__dependency {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}
```

---

## 4.9 Checklist

- [ ] Criar `TaskForm.tsx` (formulário de criação/edição)
- [ ] Criar `DurationPicker.tsx` (múltiplos de 45min)
- [ ] Criar `DependencyPicker.tsx` (multi-select com busca)
- [ ] Criar `RecurrenceConfig.tsx` (campos condicionais)
- [ ] Criar `FixedTimeConfig.tsx` (campos condicionais)
- [ ] Criar `TaskListView.tsx` (tela principal)
- [ ] Criar `TaskGroup.tsx` (agrupamento por deadline)
- [ ] Criar `TaskCard.tsx` (card na lista)
- [ ] Criar `ProgressBar.tsx` (barra de progresso)
- [ ] Implementar criação de tarefa com validação
- [ ] Implementar edição inline ou modal
- [ ] Implementar exclusão com tratamento de dependências
- [ ] Implementar geração de instâncias recorrentes
- [ ] Implementar validação de dependências circulares
- [ ] Disparar recálculo após criar/editar/excluir
- [ ] Estilizar com tema Obsidiana
- [ ] Testar todos os cenários de CRUD

---

## Próximo Documento

→ [05-DISPONIBILIDADE.md](./05-DISPONIBILIDADE.md) — Configuração de disponibilidade semanal e exceções
