#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "=============================================="
echo "Iniciando o servidor do Theomin em background..."
echo "=============================================="
echo ""

if [ ! -d "node_modules" ]; then
    echo "=============================================="
    echo "Primeira execucao detectada!"
    echo "Instalando as dependencias necessarias..."
    echo "Isso pode levar alguns minutos."
    echo "=============================================="
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    npm install
    echo ""
fi

echo "Abrindo o navegador em instantes..."

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Garante que não há processos zumbis segurando a porta do Theomin
fuser -k 5173/tcp >/dev/null 2>&1

# Diretório de dados isolado para forçar um novo processo e não agrupar com navegadores abertos
USER_DATA_DIR="$HOME/.config/theomin-app-data"
mkdir -p "$USER_DATA_DIR"

# Define o navegador a ser usado no modo App
BROWSER_CMD="xdg-open http://localhost:5173"
if command -v google-chrome >/dev/null 2>&1; then
    BROWSER_CMD="google-chrome --class=TheominApp --user-data-dir=\"$USER_DATA_DIR\" --app=http://localhost:5173"
elif command -v microsoft-edge-stable >/dev/null 2>&1; then
    BROWSER_CMD="microsoft-edge-stable --class=TheominApp --user-data-dir=\"$USER_DATA_DIR\" --app=http://localhost:5173"
elif command -v brave-browser >/dev/null 2>&1; then
    BROWSER_CMD="brave-browser --class=TheominApp --user-data-dir=\"$USER_DATA_DIR\" --app=http://localhost:5173"
elif command -v chromium-browser >/dev/null 2>&1; then
    BROWSER_CMD="chromium-browser --class=TheominApp --user-data-dir=\"$USER_DATA_DIR\" --app=http://localhost:5173"
elif command -v chromium >/dev/null 2>&1; then
    BROWSER_CMD="chromium --class=TheominApp --user-data-dir=\"$USER_DATA_DIR\" --app=http://localhost:5173"
fi

# Inicia o navegador em background aguardando o servidor ligar
nohup bash -c "while ! curl -s http://localhost:5173 > /dev/null; do sleep 1; done; $BROWSER_CMD" > /dev/null 2>&1 < /dev/null &

# Inicia o servidor Vite ignorando a saída
nohup npm run dev > /dev/null 2>&1 < /dev/null &

exit 0
