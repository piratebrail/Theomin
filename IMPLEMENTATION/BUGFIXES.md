# Log de Correções (Bugfixes)

> **Propósito deste documento:** Este arquivo funciona como um registro histórico de bugs complexos que foram diagnosticados e corrigidos durante o desenvolvimento do Theomin. A intenção primária de manter este documento é prover contexto para futuras sessões e para outros modelos de inteligência artificial que venham a trabalhar na base de código. Ao consultar este documento, o objetivo é garantir que os mesmos erros lógicos ou de arquitetura não sejam acidentalmente reintroduzidos no código durante refatorações ou na criação de novas funcionalidades.

---

## 1. Bug: Priorização de Tarefas ignorando Deadlines (01/06/2026)

### O Problema
No motor de alocação (Scheduler - `src/engine/scheduler.ts`), tarefas que não possuíam dependências entre si estavam sendo ordenadas de maneira incorreta no momento de desempate de prioridade.
O código utilizava a posição retornada pela ordenação topológica (`dependencyOrder.indexOf`) como critério de desempate rígido:
```typescript
if (orderA !== orderB) return orderA - orderB;
```
Como *todas* as tarefas têm uma posição única no array de ordenação topológica, essa linha sempre retornava verdadeiro e forçava a ordenação pelo índice do array (o que muitas vezes refletia apenas a ordem de criação no banco de dados). Isso engolia e impedia a execução das próximas regras, fazendo com que tarefas independentes ignorassem a prioridade de **Deadline**.

Como resultado, uma tarefa com Deadline para o dia 10 era alocada antes de uma tarefa para o dia 3, mesmo que ambas tivessem a mesma Prioridade de Classe e nenhuma fosse urgente.

### A Correção
A linha de checagem cega do `dependencyOrder` foi substituída por uma função determinística de checagem de linhagem funcional (`isDescendant`).
Agora, a ordem estrita de desempate em `phase3_prioritize` é:
1. Nível de urgência (`urgency > 0.7`)
2. Dependência direta ou indireta (`isDescendant` check)
3. **Deadline mais próximo** (quem vence antes, ganha a prioridade)
4. Prioridade estrita da Classe (Tie-breaker final)

Isso garantiu que o sistema respeite as datas de entrega de forma inteligente sem corromper a árvore de dependências do topological sort.

---

## 2. Comportamento (Não-Bug): Tarefa pulando espaço vazio (01/06/2026)

### O Problema (Relato de Usuário)
Usuário relatou que havia uma tarefa agendada para o mês seguinte caindo em uma segunda-feira, mesmo havendo uma enorme janela de disponibilidade vazia no domingo anterior, aparentemente pulando dias do calendário.

### O Diagnóstico
Não se tratava de um erro do agendador, mas sim de uma correta obediência à regra de **Data de Início (Start Date)** da tarefa. A tarefa foi salva com um `startDate` igual àquela segunda-feira específica (ex: 08/06/2026).
No `scheduler.ts`, existe a regra rígida de horizonte de eventos:
```typescript
if (dateStr < effectiveStart) continue;
```
Portanto, o agendador está programado para ter "cegueira cronológica" absoluta para qualquer slot de tempo que ocorra antes do `startDate` da tarefa, pulando o domingo intencionalmente. Resolvido orientando o usuário a alterar o `startDate` da atividade.

---

## 3. Bug: Script de Inicialização Falhando ao Abrir o Navegador em Background (01/06/2026)

### O Problema
Na implementação do "Modo Oculto" (executar o Vite desanexado do terminal e no background via `setsid`/`.vbs`), o navegador muitas vezes falhava em abrir ou exibia uma página em branco com erro de conexão. 
A arquitetura anterior usava um timer cego e estático (`sleep 3`) para aguardar o servidor subir antes de abrir o navegador. Ao rodar em background, a velocidade de boot da máquina node.js (cold start) do Vite caía de ~1s para ~4-6s. O navegador abria no 3º segundo, tentava dar bind na porta `5173` (que ainda estava fechada), e abortava a conexão silenciosamente.

### A Correção
O timer estático cego foi inteiramente substituído por um laço de **Polling Ativo** em ambos os SOs.
- **Linux (`Start-Theomin-Linux.sh`)**: Implementado um laço `while ! curl -s http://localhost:5173 > /dev/null; do sleep 1; done;` rodando em sua própria sessão via `setsid`. Ele pinga o servidor local iterativamente a cada 1s e só aciona o `xdg-open` ao receber HTTP 200.
- **Windows (`Start-Theomin-Windows.bat`)**: Implementado um `for /l` loop na sintaxe batch com condicional short-circuit (`&&` / `||`), usando `curl -s` da mesma maneira para testar a porta antes de executar `start http://localhost:5173`.
Isso resolveu a corrida de inicialização perfeitamente, sincronizando navegador e servidor não por tempo, mas por event-driven state.

---

## 4. Bug: Systemd Cgroup Kill destruindo servidor em background no Linux (01/06/2026)

### O Problema
Mesmo após a correção do Polling Ativo (Bug 3), quando o usuário executava o `Start-Theomin-Linux.sh` via interface gráfica (Nautilus) ou via atalho genérico, o terminal do sistema abria, rodava o script e fechava em menos de um segundo. O problema é que, no Linux (especialmente distros com Systemd e Gnome), quando o terminal é fechado, o Systemd realiza um *Cgroup Kill*: ele assassina todos os processos daquela árvore (process group/cgroup) com `SIGTERM`/`SIGKILL`, desconsiderando comandos como `nohup`, `disown`, ou duplos forks. 
Como o script intencionalmente terminava com `exit 0` para fechar o terminal e agir em "Ghost Mode", o Systemd dizimava o servidor Vite no exato momento em que ele nascia.

### A Correção
Foi diagnosticado que a única maneira limpa de escapar desse comportamento no Linux Desktop, preservando o requisito de "nenhuma janela de terminal visível", é contornar o uso de emuladores de terminal por completo.
- Gerado um arquivo nativo `Theomin.desktop` (localizado na Área de Trabalho do usuário) contendo a diretiva mágica `Terminal=false`. 
- Ao executar por esse atalho, o ambiente de desktop passa o script diretamente para o background sem instanciar um pseudo-terminal (pty) ou anexá-lo ao escopo transitório do emulador de terminal. 
- Adicionalmente, adicionou-se um mecanismo de garbage collection preventivo (`fuser -k 5173/tcp` no Linux e `taskkill` no Windows) nos scripts, para impedir que zumbis que sobreviveram a execuções prévias segurem a porta principal, o que também desestabilizava o loop de Polling e forçava o Vite a abrir em portas aleatórias (`5174`, `5175`). Todos os logs de diagnóstico foram guardados na pasta ignorada `diagnostics/`.
