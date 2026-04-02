/* eslint-disable @typescript-eslint/no-unused-vars */
// ErrorBoundary.js

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[v0] Error caught by error boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#c00', marginBottom: '1rem' }}>Something went wrong</h2>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '13px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ marginTop: '1rem', padding: '0.5rem 1.5rem', background: '#1a7a4a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
