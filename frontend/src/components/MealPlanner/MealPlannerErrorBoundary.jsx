import React from 'react';
import { logError } from './errorHandling.js';

/**
 * Error Boundary component to catch and handle React component errors
 * Prevents entire app from crashing when a component has an error
 */
class MealPlannerErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    logError(error, 'MealPlannerErrorBoundary');

    this.setState({
      error,
      errorInfo,
    });

    // You could also send the error to a logging service here
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface to-surface-container p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-outline-variant p-8">
            <div className="flex justify-center mb-4">
              <div className="bg-error-container rounded-full p-4">
                <span className="material-symbols-outlined text-error text-2xl">error</span>
              </div>
            </div>

            <h1 className="text-center text-xl font-bold text-on-surface mb-2">
              Something went wrong
            </h1>

            <p className="text-center text-sm text-on-surface-variant mb-6">
              The Meal Planner encountered an unexpected error. We apologize for the inconvenience.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-error-container/20 border border-error/30 rounded-lg p-4 mb-6 max-h-32 overflow-auto">
                <p className="text-xs font-mono text-error break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-error">
                      Stack Trace
                    </summary>
                    <pre className="text-[10px] text-error mt-2 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-6 py-3 bg-primary text-on-primary text-sm font-bold rounded-lg hover:bg-primary-container transition-colors shadow-md"
              >
                <span className="material-symbols-outlined inline mr-2 text-lg align-text-bottom">
                  refresh
                </span>
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-surface-container text-on-surface text-sm font-bold rounded-lg hover:bg-surface-container-high transition-colors border border-outline-variant"
              >
                <span className="material-symbols-outlined inline mr-2 text-lg align-text-bottom">
                  home
                </span>
                Reload Page
              </button>
            </div>

            {this.state.retryCount > 0 && (
              <p className="text-center text-xs text-on-surface-variant mt-4">
                Retry attempts: {this.state.retryCount}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MealPlannerErrorBoundary;
