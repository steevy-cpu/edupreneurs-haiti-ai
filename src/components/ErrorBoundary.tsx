import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { isChunkLoadError, handleChunkLoadError } from '@/utils/chunkLoadErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary to catch runtime errors and display a user-friendly message
 * instead of showing a blank screen or infinite loading.
 * 
 * Also handles chunk loading errors (stale cache) by auto-reloading the page.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Keep existing console log for local debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to Sentry with React component stack for meaningful traces in production.
    // No-op if Sentry was never initialised (VITE_SENTRY_DSN not set).
    // Placed before the chunk-load check so chunk errors are also tracked in Sentry.
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Chunk loading errors (stale cache) trigger auto-reload — no user action needed
    if (isChunkLoadError(error)) {
      handleChunkLoadError(error);
      return;
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Show loading state for chunk errors (page will auto-reload)
      if (isChunkLoadError(this.state.error)) {
        return (
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              backgroundColor: '#1a1a2e',
              color: '#ffffff',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid rgba(99, 102, 241, 0.3)',
                borderTopColor: '#6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#ffffff',
              }}
            >
              Mise à jour en cours...
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: '#a0a0a0',
                maxWidth: '300px',
              }}
            >
              Une nouvelle version est disponible. Rechargement automatique...
            </p>
          </div>
        );
      }
      
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            😕
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 600,
              marginBottom: '8px',
              color: '#ffffff',
            }}
          >
            Oops! Yon bagay mal pase
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#a0a0a0',
              marginBottom: '24px',
              maxWidth: '400px',
            }}
          >
            Nou regrèt pou sa. Tanpri eseye rechaje paj la.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#4f46e5';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#6366f1';
            }}
          >
            Rechaje Paj la
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#2d2d44',
                borderRadius: '8px',
                fontSize: '12px',
                textAlign: 'left',
                maxWidth: '90vw',
                overflow: 'auto',
                color: '#ff6b6b',
              }}
            >
              {this.state.error.toString()}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
