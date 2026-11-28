import { Component, type ErrorInfo, type ReactNode } from 'react';
import Error500 from '../../page/notfount/500';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: undefined,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Error inesperado en la interfaz.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary capturó un fallo:', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <Error500 message={this.state.errorMessage} onRetry={this.handleReset} />;
    }

    return this.props.children;
  }
}
