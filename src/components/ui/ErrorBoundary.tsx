import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Aqui nós poderíamos salvar o log no localStorage como backup
    const errorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      time: new Date().toISOString()
    };
    
    try {
      const logs = JSON.parse(localStorage.getItem('theomin_error_logs') || '[]');
      logs.push(errorLog);
      localStorage.setItem('theomin_error_logs', JSON.stringify(logs.slice(-10))); // Guarda últimos 10
    } catch (e) {
      // Ignora erro de localStorage
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-deepest)',
          color: 'var(--text-primary)',
          padding: '2rem',
          fontFamily: 'var(--font-sans)',
        }}>
          <AlertTriangle size={64} style={{ color: 'var(--color-danger)', marginBottom: '1rem' }} />
          <h1 style={{ marginBottom: '1rem' }}>Ops! O Theomin encontrou um erro.</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
            Em vez de uma tela preta, interceptamos a falha para você não perder dados.
            Um registro do erro foi salvo para diagnóstico.
          </p>
          
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            width: '100%',
            maxWidth: '800px',
            overflow: 'auto',
            maxHeight: '300px',
            marginBottom: '2rem',
            textAlign: 'left',
          }}>
            <h3 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem', fontSize: 'var(--text-md)' }}>
              {this.state.error?.name}: {this.state.error?.message}
            </h3>
            <pre style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: 'var(--text-xs)', 
              color: 'var(--text-muted)',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.stack}
            </pre>
          </div>

          <Button variant="primary" onClick={this.handleReset} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <RefreshCw size={16} /> Recarregar Aplicação
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
