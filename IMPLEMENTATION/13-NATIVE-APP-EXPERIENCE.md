# 13 - Integração de Janela Nativa (Desktop App Experience)

## Objetivo
Fazer com que o Theomin abra em sua própria janela independente, sem as abas e barra de endereço de um navegador comum, reforçando a imersão e o comportamento de "App Nativo". Esta solução deve funcionar de maneira consistente tanto no Windows quanto no Linux, preferencialmente se aproveitando da arquitetura de "Ghost Mode" e auto-encerramento (heartbeat) que já existe no projeto.

## Alternativas e Resultados Esperados

### 1. Browser App Mode (Recomendado)
A maioria dos navegadores modernos baseados em Chromium (Chrome, Edge, Brave, Chromium) possui uma flag oculta chamada `--app=URL`. Essa flag força o navegador a abrir o link fornecido em uma janela "limpa", sem barra de endereços, abas ou painéis laterais, criando a exata ilusão de um aplicativo nativo desktop.

**Como funciona**: Modificamos os scripts `Start-Theomin-Windows.bat` e `Start-Theomin-Linux.sh` para sondar os navegadores instalados no sistema do usuário. Assim que encontrar um Edge, Chrome ou Brave, ele lança a interface do Vite usando essa flag. Caso o usuário não tenha nenhum navegador compatível, ele faz o *fallback* silencioso e abre o navegador padrão normal.
- **Prós**: Custo zero de processamento e peso. Não adiciona absolutamente nenhuma dependência ao `package.json`. Mantém a arquitetura atual (servidor NodeJS rodando invisível que se destrói ao fechar a janela). O esforço de implementação é baixo e imediato.
- **Contras**: Depende de o usuário ter pelo menos um navegador baseado em Chromium instalado.

### 2. Tauri
Tauri é um framework ultraleve para construir aplicações desktop usando tecnologias web (React/Vite). Ele encapsula a aplicação usando a *webview* nativa do sistema operacional (Edge WebView2 no Windows, WebKitGTK no Linux).

**Como funciona**: Precisaríamos adicionar o Tauri ao projeto e mudar o nosso fluxo atual. Em vez de rodar arquivos `.bat` e `.sh`, você precisaria rodar o comando de build do Tauri, que geraria um executável `.exe` (no Windows) e um app nativo para o Linux.
- **Prós**: Verdadeiro aplicativo nativo, com processo totalmente apartado do navegador padrão do sistema. Melhor gerenciamento de memória em relação a frameworks similares (Electron).
- **Contras**: Requer instalação e configuração da linguagem de programação Rust no sistema do desenvolvedor para compilar. Adiciona mais complexidade ao ciclo de build do projeto, substituindo o atual modelo portátil onde o script inicial instala tudo sozinho.

### 3. Electron
É o padrão da indústria para empacotar aplicações web (usado por VS Code, Discord, Slack). Ele embuti o seu próprio navegador Chromium completo e seu próprio Node.js na pasta do app.

**Como funciona**: Envolveríamos a aplicação web em uma janela nativa rodando no ecossistema do Electron.
- **Prós**: Comportamento e estilo perfeitamente idênticos em qualquer OS, além de permitir manipulação profunda de arquivos locais nativamente.
- **Contras**: O aplicativo vai passar de poucos megabytes para mais de 100MB+, consumindo consideravelmente mais recursos da RAM do PC do que todas as outras alternativas, prejudicando a proposta minimalista do Theomin.

### 4. PWA (Progressive Web App)
Tornar o Theomin um Progressive Web App instalável nativamente via Chrome/Edge.

**Como funciona**: Adicionaríamos arquivos técnicos (`manifest.json` e Service Workers). Na primeira vez que abrisse, o navegador ofereceria a opção de "Instalar Theomin". Isso criaria um ícone oficial de atalho do SO.
- **Prós**: Padrão da web e muito leve.
- **Contras**: Quebra o fluxo do nosso Script de Start. O nosso script subiria o servidor, mas não teria poder de forçar o Theomin a abrir como app nativo na primeira inicialização. A experiência dependeria de você lembrar de instalar e não usar o `Start-Theomin-Linux.sh` como atalho principal da UI.

---

## Open Questions

Para eu começar a modificar os arquivos, precisaremos definir o rumo do projeto:

> [!IMPORTANT]
> **Qual abordagem se alinha melhor com o que você espera?**
> A. **App Mode dos Navegadores (Alternativa 1)**: Alterar os scripts `.bat` e `.sh` para forçar o "Kiosk/App mode". É o mais direto e que aproveita o que já temos.
> B. **Empacotar como App Desktop Nativo (Alternativa 2 - Tauri)**: Converter a arquitetura para criar executáveis independentes.
> C. **App Instalável do Navegador (Alternativa 4 - PWA)**: Seguir por PWA.

---

## Proposed Changes (Para a Alternativa 1)

Caso prefira a Alternativa 1, esta será a execução de código para aplicar a mudança nos scripts existentes:

### Scripts de Inicialização

#### [MODIFY] Start-Theomin-Windows.bat
- Adicionar uma rotina no momento da abertura da página (linha 35) que tentará localizar os executáveis do `msedge` e `chrome`.
- Substituir a chamada bruta de `start http://...` para tentar `start msedge --app="http://localhost:5173"` com fallback sucessivo até chegar no padrão do sistema.

#### [MODIFY] Start-Theomin-Linux.sh
- Modificar o trecho do laço `while` (linha 31).
- Criar uma varredura por ferramentas de linha de comando (`google-chrome`, `brave-browser`, `chromium-browser`, `microsoft-edge-stable`).
- Se encontrar, lança o Theomin via `<navegador_encontrado> --app="http://localhost:5173"`.
- Se falhar ou nenhum estiver disponível, mantemos o `xdg-open` clássico como válvula de escape.

---

## Verification Plan

Para validar a implementação:
1. **Linux (Seu ambiente atual)**: Rodar o script bash. O Theomin deve subir sem a interface de "browser" em volta da aplicação.
2. **Ghost Mode Check**: Ao apertar o botão de fechar (X) da janela recém aberta, o script do Theomin (background) deve reconhecer o encerramento após 10 segundos e se auto-destruir.
3. **Windows Compatibility**: Testar ou analisar manualmente o `.bat` modificado no Windows para garantir a injeção da variável `--app`.
