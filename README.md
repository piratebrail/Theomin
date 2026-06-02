# Theomin

Theomin é um gerenciador de tarefas inteligente focado em alocação automática de tempo. Diferente de gerenciadores tradicionais baseados em "deadlines", o Theomin quebra tarefas grandes em blocos de 45 minutos (com 15 minutos de intervalo) e os distribui automaticamente nas suas janelas de tempo livre.

Se não houver tempo suficiente para concluir todas as tarefas antes de seus respectivos prazos, o Theomin emite um alerta e organiza as tarefas atrasadas por ordem de criticidade.

## Tecnologias

- **Frontend:** React + TypeScript + Vite
- **Gerenciamento de Estado:** Zustand
- **Banco de Dados Local:** IndexedDB via Dexie.js
- **Estilização:** CSS puro com CSS Variables (Tema "Obsidiana")
- **Drag-and-Drop:** @dnd-kit

## Progresso da Implementação

Este projeto está sendo construído em Sprints. O progresso atual é:

- ✅ **Sprint 1: Fundação e Modelo de Dados** (Concluído)
  - Configuração do projeto Vite + React + TS
  - Configuração do Dexie.js com schema do IndexedDB
  - Criação de Stores do Zustand (Tasks, Classes, Disponibilidade, Calendário)
  - Implementação de Design Tokens e Componentes UI Base (Tema Obsidiana)
  - Criação do App Shell com navegação lateral

- ✅ **Sprint 2: Classes + Disponibilidade** (Concluído)
  - Board Kanban para gerenciar as prioridades de cada classe com drag-and-drop
  - Visualização e configuração da disponibilidade de horários (padrão semanal)
  - Sistema de exceções para datas específicas

- ✅ **Sprint 5: Gerenciamento de Tarefas** (Concluído)
- ✅ **Sprint 3: Motor de Alocação (Core)** (Concluído)
- ✅ **Sprint 4: Visualização do Calendário** (Concluído)
- ✅ **Sprint 6: Painel de Atrasadas e Resolução de Conflitos** (Concluído)
- ✅ **Sprint 7: Revisão UX e Ajustes** (Concluído)
- ✅ **Sprint 8: Testes e Polimento** (Concluído)

## Documentação Adicional

O desenvolvimento do Theomin seguiu um planejamento rigoroso. Você pode encontrar os logs de nossa evolução nos seguintes arquivos da pasta `IMPLEMENTATION/`:
- **[Implementações Pós MVP](IMPLEMENTATION/IMPLEMENTAÇÕES-PÓS-MVP.md)**: Registro de todas as features extras adicionadas após o fechamento do escopo original.
- **[Log de Bugfixes](IMPLEMENTATION/BUGFIXES.md)**: Diagnóstico e correção de problemas crônicos para prevenir regressões de código.

## Como Rodar Localmente

1. Clone o repositório
2. Execute `npm install`
3. Execute `npm run dev`
4. Acesse `http://localhost:5173`
