import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Rendered in place of the children once something below has thrown. */
  fallback: ReactNode;
  onError?: (error: Error) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

/** Contains a rendering failure to one part of the page instead of blanking all of it. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('A section failed to render', error, info.componentStack);
    this.props.onError?.(error);
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
