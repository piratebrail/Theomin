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

# Inicia o navegador em background aguardando o servidor ligar
nohup bash -c "while ! curl -s http://localhost:5173 > /dev/null; do sleep 1; done; xdg-open http://localhost:5173" > /dev/null 2>&1 < /dev/null &

# Inicia o servidor Vite ignorando a saída
nohup npm run dev > /dev/null 2>&1 < /dev/null &

exit 0
