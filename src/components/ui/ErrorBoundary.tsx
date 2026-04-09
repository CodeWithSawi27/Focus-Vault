import { Component, type ReactNode, type ErrorInfo } from "react";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
  // Optional custom fallback — defaults to ErrorFallback
  fallback?: (error: Error, retry: () => void) => ReactNode;
  // Called when an error is caught — use for logging (Sentry etc.)
  onError?: (error: Error, info: ErrorInfo) => void;
  // Compact mode passed through to default fallback
  compact?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);

    if (__DEV__) {
      console.error("[ErrorBoundary] Caught error:", error);
      console.error("[ErrorBoundary] Component stack:", info.componentStack);
    }
    // Production: swap onError for Sentry.captureException(error, { extra: info })
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback && this.state.error) {
      return this.props.fallback(this.state.error, this.handleRetry);
    }

    return (
      <ErrorFallback
        error={this.state.error ?? undefined}
        onRetry={this.handleRetry}
        compact={this.props.compact}
      />
    );
  }
}
