# Implementações Pós MVP

Este documento registra todas as melhorias, polimentos e novas funcionalidades que foram adicionadas ao Theomin após a conclusão do escopo inicial do MVP (Minimum Viable Product). O objetivo é manter um histórico do que foi incrementado na experiência do usuário e na lógica do sistema.

## 1. Melhorias na Interface do Calendário
- **Visualização de Tempo Disponível**: O calendário agora pinta as faixas de tempo livre/indisponível com um background diferente (baseado nas configurações de "Disponibilidade" da semana), permitindo ao usuário bater o olho e ver onde tem tempo livre.
- **Scroll e Alinhamento**: As horas e dias rolam de maneira orgânica; a barra lateral com os horários foi ajustada para cobrir até a base do contêiner sem quebrar o layout; a quina vazia do calendário foi geometricamente alinhada.
- **Integração de Edição**: Agora, ao clicar no "bloco" de uma tarefa diretamente na grade do calendário, o pop-up de formulário completo daquela tarefa (`TaskForm`) se abre, permitindo a visualização e edição de propriedades da tarefa em tempo real sem precisar ir para a aba de "Atividades".

## 2. Refatoração do Painel de Tarefas Atrasadas
O painel de tarefas atrasadas (`OverduePanel`) foi inteiramente reformulado para otimizar o fluxo de trabalho:
- **Checkbox Direto**: O botão "Encaixar na agenda" foi removido. Em seu lugar, inserimos um checkbox no estilo tradicional do app. Clicar nele marca imediatamente a tarefa como "Concluída" e a remove da fila do desespero.
- **Integração de Edição**: Assim como no calendário, clicar no meio do card da tarefa atrasada agora abre o pop-up de edição completa. O botão "Adiar deadline" foi removido por redundância.
- **Redesign do Layout**: O card da tarefa atrasada virou um formato híbrido em Grid 2x2. O nome e classe no topo, e em destaque visual massivo em duas caixas separadas embaixo: a data do **Deadline** (e quantos dias está atrasado) e o **Esforço Restante** (tempo que falta para concluir).

## 3. Criação e Evolução da Aba de Compromissos Importantes
Foi desenhado um novo painel lateral dentro do calendário chamado **Compromissos Importantes**.
- **Função**: Serve para listar marcos fixos (Provas, Viagens, Consultas) que não são necessariamente "blocos de horas", mas eventos. Eles são listados cronologicamente, do mais próximo para o mais distante.
- **Tag de Urgência**: Cada compromisso ganhou uma tag lateral automática mostrando quantos dias faltam.
  - Se falta mais de 15 dias: Cor normal.
  - Entre 15 e 7 dias: Amarelo (Atenção).
  - Menos de 7 dias: Vermelho (Urgente).
- **Bloco de Notas e Anexos (Feature Recente)**: Ao clicar no compromisso, abre-se uma tela ("bloquinho de notas") que permite escrever Anotações Gerais de texto livre e colar **Caminhos Locais de Arquivos** do computador (como PDFs de provas ou roteiros de viagem). O modal permite gerenciar esses links e copiar os caminhos rapidamente com um botão, contornando a restrição de segurança dos navegadores.

## 4. Polimento Geral de UX e Lógica
- **Experiência Limpa**: Removidas todas as telas de introdução/tutorial obrigatórias para entregar o usuário direto para o valor principal do aplicativo.
- **Prioridade Padrão**: Na criação de novas tarefas, a classe que vem pré-selecionada no combobox foi alterada para ser automaticamente a classe de maior prioridade do usuário (Priority Level 0).
- **Core Engine (Bugfix/Optimization)**: O algoritmo de desempate de tarefas foi severamente ajustado para respeitar o "Deadline mais próximo" como regra suprema quando tarefas não dependem umas das outras, em vez de depender cegamente de prioridade de cor da classe ou ordem no banco de dados. (Documentado em detalhes no `BUGFIXES.md`).

## 5. Experiência de App Nativo (Terminal Oculto e Auto-Encerramento)
O sistema de inicialização foi arquitetado para imitar o comportamento de um aplicativo desktop clássico, abstraindo a natureza web do projeto:
- **Scripts Autônomos Inteligentes**: Os scripts `Start-Theomin-Windows.bat` e `Start-Theomin-Linux.sh` agora instalam dependências dinamicamente (se não houver `node_modules`).
- **Execução Oculta (Ghost Mode)**: O terminal que roda o servidor Vite foi completamente silenciado. No Windows, ele cria um `.vbs` temporário para se relançar de forma totalmente invisível. No Linux, usa `nohup` desacoplado do painel do usuário.
- **Auto-Shutdown por Heartbeat**: Como o servidor não tem janela visível para o usuário encerrá-lo, o front-end envia um "ping" silencioso a cada 3 segundos. Se a página web for fechada, o servidor no background detecta o silêncio de 10 segundos e emite um `process.exit(0)` para se auto-destruir e liberar a memória RAM do computador automaticamente.

## 6. Funcionalidades Recentes (Atualizações Contínuas)
- **Compromissos Importantes**:
  - Edição in-place do título e data de compromissos diretamente no card.
  - Vínculo Tarefa ↔ Compromisso: Tarefas agora podem ser atreladas a um compromisso específico através de um novo dropdown no formulário. Se o compromisso for marcado como concluído, todas as tarefas atreladas a ele são concluídas em cascata.
- **Gerenciamento de Blocos no Calendário**:
  - O usuário agora pode excluir (reduzir a duração total) blocos de tarefas diretamente pelo calendário clicando no ícone de lixeira no card.
  - Se a tarefa tiver seu tempo esgotado (ficar com duração zero), ela é completamente excluída.
  - Implementado sistema de notificação via Toast com a ação "Desfazer (Undo)". O toast conta com um timer inteligente que pausa quando o mouse está sobre ele, e a função Undo restaura perfeitamente os blocos, propriedades e status das tarefas no banco de dados.
- **Lista de Tarefas (Aba)**:
  - As tarefas 100% concluídas agora são isoladas em um grupo próprio na base da lista ("✅ CONCLUÍDAS"), organizado em ordem cronológica reversa.
- **Polimento Visual & UX**:
  - Correção do `z-index` da barra de hora atual do calendário, garantindo que ela não se sobreponha sobre a barra adesiva de datas.
  - Refatoração total do visual do painel de navegação esquerdo (Sidebar), transformando links em botões polidos com caixas interativas, espaçamentos ideais e transição de hover.
  - Correção da qualidade e dimensionamento do ícone Nativo Desktop: O ícone PNG gigante foi convertido em versões adequadas (incluindo 512x512) providenciando compatibilidade e exibição livre de pixels nos painéis de tarefas Linux.
- **Bugfix Crítico no Scheduler Engine**:
  - Corrigido um bug matemático no motor de alocação de blocos (scheduler) que resultava na dupla contagem de blocos (já alocados vs em geração) a cada virada de dia de uma tarefa contínua, causando "pulos" nos numerais das etiquetas dos blocos ("Bloco 5/10" pulando direto para "Bloco 9/10").
