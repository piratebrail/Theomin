# 05 — Disponibilidade Semanal

Este documento cobre a configuração de horários disponíveis do usuário: o padrão semanal fixo e as exceções por data.

---

## 5.1 Conceito

O usuário define **quando** está disponível para trabalhar. Essa informação é essencial para o algoritmo de alocação saber **onde** encaixar os blocos de 45 minutos.

### Estrutura

- **Padrão semanal**: configuração fixa para cada dia da semana (seg, ter, qua...). Repetido toda semana.
- **Exceções**: alterações em datas específicas. Ex: "nesta quarta-feira tenho mais tempo" ou "sábado é folga".
- **Finais de semana**: tratados como qualquer dia — podem ter disponibilidade.
- **Múltiplas faixas por dia**: permitido. Ex: 9h-10h45 e 14h-16h45.

### Regra dos múltiplos

Cada faixa de tempo deve comportar um número inteiro de blocos de 45min com intervalos de 15min entre eles:

| Faixa | Duração | Blocos | Composição |
|---|---|---|---|
| 9:00 - 9:45 | 45min | 1 | 45 |
| 9:00 - 10:45 | 1h45 | 2 | 45 + 15 + 45 |
| 9:00 - 12:30 | 3h30 | — | ❌ Inválido! |
| 9:00 - 12:45 | 3h45 | 3 | 45 + 15 + 45 + 15 + 45 |
| 14:00 - 18:45 | 4h45 | 4 | 45 + 15 + 45 + 15 + 45 + 15 + 45 |

**Fórmula**: Duração válida = `45 + (n-1) × 60` minutos para `n` blocos.
- 1 bloco: 45min
- 2 blocos: 105min (1h45)
- 3 blocos: 165min (2h45)
- 4 blocos: 225min (3h45)
- ...

---

## 5.2 Interface: Configuração Semanal

### Layout da tela

```
┌──────────────────────────────────────────────────────────────────┐
│  Disponibilidade Semanal                                        │
│  Configure seus horários de trabalho para cada dia da semana.    │
│  ─────────────────────────────────────────────────────────────── │
│                                                                  │
│  ┌─── Segunda-feira ────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  ┌──────────┐     ┌──────────┐     ┌───┐                │   │
│  │  │  09:00   │ até │  10:45   │     │ ✕ │                │   │
│  │  └──────────┘     └──────────┘     └───┘                │   │
│  │                                                          │   │
│  │  ┌──────────┐     ┌──────────┐     ┌───┐                │   │
│  │  │  14:00   │ até │  16:45   │     │ ✕ │                │   │
│  │  └──────────┘     └──────────┘     └───┘                │   │
│  │                                                          │   │
│  │  + Adicionar faixa horária                     2 faixas  │   │
│  │  Total: 4h30 (4 blocos de 45min)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── Terça-feira ──────────────────────────────────────────┐   │
│  │  ┌──────────┐     ┌──────────┐     ┌───┐                │   │
│  │  │  09:00   │ até │  10:45   │     │ ✕ │                │   │
│  │  └──────────┘     └──────────┘     └───┘                │   │
│  │                                                          │   │
│  │  + Adicionar faixa horária                     1 faixa   │   │
│  │  Total: 1h45 (2 blocos de 45min)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─── Quarta-feira ─────────────────────────────────────────┐   │
│  │  Nenhum horário configurado                              │   │
│  │  + Adicionar faixa horária                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ... (Quinta, Sexta, Sábado, Domingo)                           │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  Resumo semanal: 18h (16 blocos de 45min disponíveis)           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Componentes

```
src/components/availability/
├── AvailabilityView.tsx       # Tela principal
├── DaySchedule.tsx            # Configuração de um dia da semana
├── TimeSlotRow.tsx            # Uma faixa horária (início-fim)
├── TimeInput.tsx              # Input de horário com validação
├── ExceptionsList.tsx         # Lista de exceções
├── ExceptionModal.tsx         # Modal para criar exceção
├── WeeklySummary.tsx          # Resumo semanal
└── AvailabilityView.css       # Estilos
```

---

## 5.3 TimeInput — Seletor de Horário

O seletor de horário deve restringir as opções para que as faixas resultantes sejam válidas.

### Comportamento do horário de início

- Qualquer horário em intervalos de 15 minutos: 00:00, 00:15, 00:30, 00:45, 01:00...
- O usuário digita ou seleciona de um dropdown

### Comportamento do horário de fim

- **Depende do horário de início escolhido**
- Deve resultar em uma faixa válida (múltiplo da fórmula)
- As opções são calculadas dinamicamente:

```typescript
function getValidEndTimes(startTime: string): string[] {
  const startMinutes = timeToMinutes(startTime);
  const options: string[] = [];
  
  // Gerar fins válidos: start + 45, start + 105, start + 165, ...
  // Ou seja: start + 45 + (n * 60) para n = 0, 1, 2, ...
  for (let blocks = 1; blocks <= 12; blocks++) {
    const duration = 45 + (blocks - 1) * 60; // 45, 105, 165, 225...
    const endMinutes = startMinutes + duration;
    
    if (endMinutes > 24 * 60) break; // Não pode passar da meia-noite
    
    options.push(minutesToTime(endMinutes));
  }
  
  return options;
}

// Exemplo: startTime = "09:00" (540min)
// → ["09:45", "10:45", "11:45", "12:45", "13:45", ...]
// Ou, em formato mais legível:
// → 09:45 (1 bloco), 10:45 (2 blocos), 11:45 (3 blocos), ...
```

**Nota**: o cálculo acima resulta em horários de fim como `09:45`, `10:45`, etc. Isso acontece porque:
- 1 bloco: 09:00 + 45min = 09:45 ✅
- 2 blocos: 09:00 + 45 + 15 + 45 = 10:45 ✅
- 3 blocos: 09:00 + 45 + 15 + 45 + 15 + 45 = 11:45 ✅

---

## 5.4 Validações de Faixas

### Regras de validação

```typescript
function validateTimeSlots(slots: TimeSlot[]): ValidationResult {
  const errors: string[] = [];
  
  for (const slot of slots) {
    // 1. Horário de fim deve ser posterior ao início
    if (timeToMinutes(slot.endTime) <= timeToMinutes(slot.startTime)) {
      errors.push(`Horário de fim deve ser após o início`);
    }
    
    // 2. Faixa deve ser válida (múltiplo correto)
    if (!isValidTimeSlot(slot)) {
      errors.push(`Faixa ${slot.startTime}-${slot.endTime} não comporta blocos completos de 45min`);
    }
  }
  
  // 3. Faixas não podem se sobrepor
  const sorted = [...slots].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  
  for (let i = 1; i < sorted.length; i++) {
    if (timeToMinutes(sorted[i].startTime) < timeToMinutes(sorted[i-1].endTime)) {
      errors.push(`Faixas se sobrepõem: ${sorted[i-1].endTime} e ${sorted[i].startTime}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Feedback visual

- **Faixa válida**: borda verde suave
- **Faixa inválida**: borda vermelha + mensagem de erro abaixo
- **Sobreposição**: highlight vermelho nas faixas conflitantes
- **Resumo**: mostrar total de blocos disponíveis por dia

---

## 5.5 Exceções

### O que é uma exceção?

Uma alteração na disponibilidade para um **dia específico** que sobrescreve o padrão semanal.

### Cenários

| Cenário | Ação |
|---|---|
| "Quarta tenho aula extra" | Reduzir faixas da quarta |
| "Sábado vou trabalhar" | Adicionar faixas ao sábado |
| "Feriado" | Marcar como "Dia de folga" (sem disponibilidade) |
| "Semana de provas" | Adicionar mais horas em vários dias |

### Interface de exceções

Abaixo do padrão semanal, uma seção mostra exceções existentes e permite criar novas:

```
┌─── Exceções ────────────────────────────────────────────┐
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📅 02/06/2026 (segunda-feira)                   │   │
│  │  Substituindo padrão: 2 faixas → 1 faixa         │   │
│  │  09:00 - 12:45 (3 blocos)                        │   │
│  │  ┌────────┐                                      │   │
│  │  │ Editar │  │ Remover │                         │   │
│  │  └────────┘                                      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📅 05/06/2026 (quinta-feira)                    │   │
│  │  🏖️ Dia de folga                                 │   │
│  │  ┌────────┐                                      │   │
│  │  │ Editar │  │ Remover │                         │   │
│  │  └────────┘                                      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  + Adicionar exceção                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Modal de exceção

```
┌─────────────────────────────────────────┐
│  ✕                                       │
│                                          │
│  Exceção de Disponibilidade              │
│                                          │
│  Data                                    │
│  ┌──────────────────────────┐            │
│  │ 📅 02/06/2026            │            │
│  └──────────────────────────┘            │
│  (segunda-feira — padrão: 4h30)          │
│                                          │
│  ☐ Dia de folga (sem disponibilidade)    │
│                                          │
│  Faixas horárias para este dia:          │
│  ┌──────────┐     ┌──────────┐   ┌───┐  │
│  │  09:00   │ até │  12:45   │   │ ✕ │  │
│  └──────────┘     └──────────┘   └───┘  │
│                                          │
│  + Adicionar faixa                       │
│                                          │
│  ┌──────────┐       ┌──────────────────┐ │
│  │ Cancelar │       │ Salvar Exceção   │ │
│  └──────────┘       └──────────────────┘ │
│                                          │
└─────────────────────────────────────────┘
```

---

## 5.6 Cálculo de Slots Efetivos

A função mais importante deste módulo: dado uma data, retornar os slots de tempo disponíveis.

```typescript
// src/stores/availabilityStore.ts

function getEffectiveSlots(date: string): TimeSlot[] {
  // 1. Verificar se existe exceção para esta data
  const exception = exceptions.find(e => e.date === date);
  
  if (exception) {
    // Se é dia de folga, retorna vazio
    if (exception.isDayOff) return [];
    // Caso contrário, retorna os slots da exceção
    return exception.slots;
  }
  
  // 2. Se não há exceção, usar o padrão semanal
  const dayOfWeek = new Date(date).getDay(); // 0-6
  return weeklyPattern[dayOfWeek] || [];
}
```

### Cálculo de blocos disponíveis em um dia

```typescript
function getAvailableBlockCount(date: string): number {
  const slots = getEffectiveSlots(date);
  let totalBlocks = 0;
  
  for (const slot of slots) {
    const duration = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    // Blocos = 1 + (duration - 45) / 60
    const blocks = 1 + (duration - 45) / 60;
    totalBlocks += blocks;
  }
  
  return totalBlocks;
}
```

---

## 5.7 Persistência

### Padrão semanal

Salvo como uma única entrada na tabela `settings` do IndexedDB:

```typescript
await db.settings.put({
  key: 'weeklyAvailability',
  value: weeklyPattern
});
```

### Exceções

Cada exceção é uma entrada separada na tabela `availabilityExceptions`:

```typescript
await db.availabilityExceptions.add({
  id: nanoid(),
  date: '2026-06-02',
  slots: [{ startTime: '09:00', endTime: '12:45' }],
  isDayOff: false,
});
```

### Limpeza

Exceções de datas passadas (mais de 30 dias atrás) podem ser removidas periodicamente para não poluir o banco.

---

## 5.8 Estilos (Tema Obsidiana)

```css
/* src/components/availability/AvailabilityView.css */

.availability-view {
  max-width: 800px;
  margin: 0 auto;
}

/* ===== DAY SCHEDULE ===== */
.day-schedule {
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-md);
  transition: border-color var(--transition-fast);
}

.day-schedule:hover {
  border-color: var(--border-default);
}

.day-schedule__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.day-schedule__name {
  font-weight: var(--weight-semibold);
  color: var(--text-primary);
}

.day-schedule__summary {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* ===== TIME SLOT ROW ===== */
.time-slot-row {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.time-slot-row__separator {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.time-slot-row__remove {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.time-slot-row__remove:hover {
  color: var(--color-danger);
}

/* ===== TIME INPUT ===== */
.time-input {
  width: 100px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: var(--text-base);
}

/* ===== ADD SLOT BUTTON ===== */
.day-schedule__add {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--text-muted);
  font-size: var(--text-sm);
  padding: var(--space-xs) 0;
  transition: color var(--transition-fast);
}

.day-schedule__add:hover {
  color: var(--accent-base);
}

/* ===== WEEKLY SUMMARY ===== */
.weekly-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  background: var(--accent-subtle);
  border: 1px solid var(--accent-base);
  border-radius: var(--radius-lg);
  margin-top: var(--space-xl);
}

.weekly-summary__label {
  color: var(--text-secondary);
}

.weekly-summary__value {
  font-size: var(--text-xl);
  font-weight: var(--weight-bold);
  color: var(--accent-base);
}
```

---

## 5.9 Checklist

- [ ] Criar `AvailabilityView.tsx` (tela principal)
- [ ] Criar `DaySchedule.tsx` (um dia da semana)
- [ ] Criar `TimeSlotRow.tsx` (uma faixa horária)
- [ ] Criar `TimeInput.tsx` (input de horário com restrições)
- [ ] Implementar cálculo dinâmico de horários de fim válidos
- [ ] Implementar validação de sobreposição de faixas
- [ ] Criar `WeeklySummary.tsx` (resumo com total de blocos)
- [ ] Criar `ExceptionsList.tsx` (lista de exceções)
- [ ] Criar `ExceptionModal.tsx` (criar/editar exceção)
- [ ] Implementar `getEffectiveSlots()` no AvailabilityStore
- [ ] Implementar `getAvailableBlockCount()` para o algoritmo
- [ ] Persistir padrão semanal em settings
- [ ] Persistir exceções na tabela dedicada
- [ ] Implementar limpeza de exceções antigas
- [ ] Estilizar com tema Obsidiana
- [ ] Testar cenários: dia sem disponibilidade, dia com exceção, múltiplas faixas

---

## Próximo Documento

→ [06-ALGORITMO-ALOCACAO.md](./06-ALGORITMO-ALOCACAO.md) — O motor de scheduling (coração do Theomin)
