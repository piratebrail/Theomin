# 01 — Setup e Fundação

Este documento cobre a criação do projeto, a configuração do ambiente de desenvolvimento, e o design system com o tema Obsidiana.

---

## 1.1 Inicialização do Projeto

### Criar o projeto Vite + React + TypeScript

```bash
npx -y create-vite@latest ./ --template react-ts
```

### Instalar dependências

```bash
# State management
npm install zustand

# IndexedDB
npm install dexie

# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Date handling
npm install date-fns

# Icons
npm install lucide-react

# Unique IDs
npm install nanoid
```

---

## 1.2 Configuração do Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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
```

### TypeScript paths

```json
// tsconfig.json (adicionar no compilerOptions)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@stores/*": ["src/stores/*"],
      "@engine/*": ["src/engine/*"],
      "@db/*": ["src/db/*"],
      "@hooks/*": ["src/hooks/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@styles/*": ["src/styles/*"]
    }
  }
}
```

---

## 1.3 Tema Obsidiana — Design Tokens

O tema "Obsidiana" é dark com acentos roxos. Inspirado em interfaces como Obsidian, Discord, e terminais modernos.

### Paleta de Cores

```css
/* src/styles/index.css */

:root {
  /* ===== BACKGROUNDS ===== */
  --bg-deepest:    hsl(260, 20%, 6%);    /* Fundo mais profundo (sidebar) */
  --bg-deep:       hsl(260, 18%, 9%);    /* Fundo principal */
  --bg-base:       hsl(260, 16%, 12%);   /* Cards, painéis */
  --bg-elevated:   hsl(260, 14%, 16%);   /* Elementos elevados, hovers */
  --bg-surface:    hsl(260, 12%, 20%);   /* Inputs, dropdowns */
  
  /* ===== BORDERS ===== */
  --border-subtle:  hsl(260, 10%, 18%);  /* Bordas suaves */
  --border-default: hsl(260, 10%, 24%);  /* Bordas padrão */
  --border-strong:  hsl(260, 12%, 32%);  /* Bordas fortes (foco) */

  /* ===== TEXT ===== */
  --text-primary:   hsl(260, 10%, 92%);  /* Texto principal */
  --text-secondary: hsl(260, 8%, 64%);   /* Texto secundário */
  --text-muted:     hsl(260, 6%, 44%);   /* Texto apagado */
  --text-disabled:  hsl(260, 4%, 30%);   /* Texto desabilitado */

  /* ===== ACCENT (Roxo Obsidiana) ===== */
  --accent-base:    hsl(265, 70%, 58%);  /* Roxo principal */
  --accent-hover:   hsl(265, 70%, 64%);  /* Roxo hover */
  --accent-active:  hsl(265, 70%, 50%);  /* Roxo active/pressed */
  --accent-subtle:  hsl(265, 40%, 18%);  /* Roxo sutil (backgrounds) */
  --accent-glow:    hsla(265, 70%, 58%, 0.15); /* Glow effect */

  /* ===== SEMANTIC ===== */
  --color-success:  hsl(150, 60%, 45%);  /* Verde — tarefa concluída */
  --color-warning:  hsl(38, 80%, 55%);   /* Âmbar — prazo próximo */
  --color-danger:   hsl(0, 65%, 55%);    /* Vermelho — atrasada */
  --color-info:     hsl(210, 70%, 55%);  /* Azul — informação */

  /* ===== BLOCKS (cores das classes de atividade) ===== */
  --block-purple:   hsl(265, 55%, 55%);
  --block-blue:     hsl(215, 60%, 50%);
  --block-cyan:     hsl(185, 55%, 45%);
  --block-green:    hsl(150, 50%, 45%);
  --block-yellow:   hsl(45, 70%, 50%);
  --block-orange:   hsl(25, 70%, 52%);
  --block-red:      hsl(0, 55%, 52%);
  --block-pink:     hsl(330, 55%, 55%);
  --block-indigo:   hsl(240, 50%, 55%);
  --block-teal:     hsl(170, 50%, 42%);
  
  /* ===== BREAK BLOCK ===== */
  --break-bg:       hsla(260, 10%, 30%, 0.3);  /* Cinza transparente */
  --break-border:   hsla(260, 10%, 40%, 0.2);

  /* ===== COMPLETED BLOCK ===== */
  --completed-opacity: 0.35;

  /* ===== SPACING ===== */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  12px;
  --space-lg:  16px;
  --space-xl:  24px;
  --space-2xl: 32px;
  --space-3xl: 48px;

  /* ===== TYPOGRAPHY ===== */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.8125rem; /* 13px */
  --text-base: 0.875rem;  /* 14px */
  --text-lg:   1rem;      /* 16px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  2rem;      /* 32px */

  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;

  /* ===== BORDER RADIUS ===== */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-full: 9999px;

  /* ===== SHADOWS ===== */
  --shadow-sm:  0 1px 2px hsla(0, 0%, 0%, 0.3);
  --shadow-md:  0 4px 12px hsla(0, 0%, 0%, 0.4);
  --shadow-lg:  0 8px 24px hsla(0, 0%, 0%, 0.5);
  --shadow-glow: 0 0 20px var(--accent-glow);

  /* ===== TRANSITIONS ===== */
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;
  --transition-slow:   400ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ===== Z-INDEX ===== */
  --z-base:     1;
  --z-dropdown: 10;
  --z-sticky:   20;
  --z-modal:    100;
  --z-toast:    200;
  --z-tooltip:  300;

  /* ===== CALENDAR SPECIFIC ===== */
  --calendar-hour-height: 64px;       /* Altura de 1h no calendário */
  --calendar-block-height: 48px;      /* Altura de um bloco de 45min */
  --calendar-break-height: 16px;      /* Altura de um intervalo de 15min */
  --calendar-gutter: 60px;            /* Largura da coluna de horas */
  --calendar-line-color: var(--border-subtle);
  
  /* ===== SIDEBAR ===== */
  --sidebar-width: 240px;
  --sidebar-collapsed: 64px;
}
```

### Reset e Base Global

```css
/* src/styles/index.css (continuação) */

/* ===== GOOGLE FONTS ===== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* ===== RESET ===== */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--weight-normal);
  color: var(--text-primary);
  background-color: var(--bg-deep);
  line-height: 1.5;
  min-height: 100vh;
  overflow: hidden;
}

a {
  color: var(--accent-base);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--accent-hover);
}

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

input, select, textarea {
  font-family: inherit;
  font-size: inherit;
  color: var(--text-primary);
  background-color: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

input:focus, select:focus, textarea:focus {
  border-color: var(--accent-base);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* ===== SCROLLBAR ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}

/* ===== UTILITY CLASSES ===== */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

/* ===== ANIMATIONS ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px var(--accent-glow); }
  50% { box-shadow: 0 0 20px var(--accent-glow); }
}
```

---

## 1.4 Componentes UI Base

Antes de construir features, criar componentes reutilizáveis:

### Componentes necessários

| Componente | Descrição | Arquivo |
|---|---|---|
| `Button` | Variantes: primary, secondary, ghost, danger. Tamanhos: sm, md, lg | `ui/Button.tsx` |
| `IconButton` | Botão circular com ícone | `ui/IconButton.tsx` |
| `Input` | Campo de texto com label e validação | `ui/Input.tsx` |
| `Select` | Dropdown customizado | `ui/Select.tsx` |
| `Modal` | Overlay com animação de entrada/saída | `ui/Modal.tsx` |
| `Tooltip` | Tooltip posicional | `ui/Tooltip.tsx` |
| `Badge` | Badge numérico (para contagem de atrasadas) | `ui/Badge.tsx` |
| `DatePicker` | Seletor de data simples | `ui/DatePicker.tsx` |
| `TimePicker` | Seletor de horário (múltiplos de 15min) | `ui/TimePicker.tsx` |
| `DurationPicker` | Seletor de duração (múltiplos de 45min) | `ui/DurationPicker.tsx` |
| `ColorPicker` | Seletor de cor para classes | `ui/ColorPicker.tsx` |
| `Sidebar` | Navegação lateral colapsável | `ui/Sidebar.tsx` |
| `Toast` | Notificações temporárias | `ui/Toast.tsx` |

### Exemplo: Button

```tsx
// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  icon, 
  children, 
  className,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''} ${className || ''}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children && <span className="btn__label">{children}</span>}
    </button>
  );
}
```

```css
/* Estilos do Button no tema obsidiana */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  border-radius: var(--radius-md);
  font-weight: var(--weight-medium);
  transition: all var(--transition-fast);
  white-space: nowrap;
  user-select: none;
}

.btn--sm { padding: 6px 12px; font-size: var(--text-sm); }
.btn--md { padding: 8px 16px; font-size: var(--text-base); }
.btn--lg { padding: 12px 24px; font-size: var(--text-lg); }

.btn--primary {
  background: var(--accent-base);
  color: white;
}
.btn--primary:hover { background: var(--accent-hover); }
.btn--primary:active { background: var(--accent-active); }

.btn--secondary {
  background: var(--bg-elevated);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
.btn--secondary:hover { 
  background: var(--bg-surface);
  border-color: var(--border-strong);
}

.btn--ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn--ghost:hover { 
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.btn--danger {
  background: var(--color-danger);
  color: white;
}
.btn--danger:hover { 
  background: hsl(0, 65%, 60%);
}

.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

---

## 1.5 Layout Principal (App Shell)

```tsx
// src/App.tsx (estrutura básica)
import { Sidebar } from '@components/ui/Sidebar';
import { CalendarView } from '@components/calendar/CalendarView';
import { TaskListView } from '@components/tasks/TaskListView';
import { ClassBoardView } from '@components/classes/ClassBoardView';
import { AvailabilityView } from '@components/availability/AvailabilityView';
import { OverduePanel } from '@components/overdue/OverduePanel';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('calendar');

  return (
    <div className="app-shell">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="app-main">
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'tasks' && <TaskListView />}
        {activeView === 'classes' && <ClassBoardView />}
        {activeView === 'availability' && <AvailabilityView />}
        {activeView === 'overdue' && <OverduePanel />}
      </main>
    </div>
  );
}
```

```css
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-xl);
}
```

---

## 1.6 Checklist da Fundação

- [ ] Criar projeto com Vite + React + TypeScript
- [ ] Instalar todas as dependências
- [ ] Configurar aliases de path (vite.config + tsconfig)
- [ ] Criar `src/styles/index.css` com design tokens completos
- [ ] Criar estrutura de pastas
- [ ] Implementar componentes UI base (Button, Input, Modal, etc.)
- [ ] Implementar Sidebar com navegação
- [ ] Implementar App shell com troca de views
- [ ] Verificar que o tema obsidiana funciona corretamente
- [ ] Testar responsividade básica

---

## Próximo Documento

→ [02-MODELO-DE-DADOS.md](./02-MODELO-DE-DADOS.md) — Modelos de dados, schema IndexedDB e stores Zustand
