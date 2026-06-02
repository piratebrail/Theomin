import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'auto-shutdown',
      configureServer(server) {
        let lastPing = Date.now();
        let hasConnected = false;

        server.middlewares.use('/api/ping', (req, res) => {
          hasConnected = true;
          lastPing = Date.now();
          res.end('ok');
        });

        // Checa a cada 5 segundos se o Theomin está ocioso há mais de 10s
        setInterval(() => {
          if (hasConnected && Date.now() - lastPing > 10000) {
            console.log('Nenhuma aba ativa detectada. Encerrando o servidor...');
            process.exit(0);
          }
        }, 5000);
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@db': path.resolve(__dirname, './src/db'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    }
  }
})
