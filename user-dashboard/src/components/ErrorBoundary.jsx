import React from "react";

/**
 * ErrorBoundary
 *
 * Catches errors thrown by lazy-loaded route chunks (e.g. "Failed to fetch
 * dynamically imported module" when a hashed chunk no longer exists on the
 * server after a new deploy) and renders a friendly recovery screen instead
 * of letting the whole app crash to a blank/white page.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, isChunkError: false };
  }

  static getDerivedStateFromError(error) {
    const message = error && error.message ? error.message : String(error);
    // Detect dynamic import / chunk-load failures (stale deployment chunks).
    const isChunkError =
      /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Failed to fetch.*\.js|Loading chunk \d+ failed/i.test(
        message
      );
    return { hasError: true, isChunkError };
  }

  componentDidCatch(error, errorInfo) {
    // Keep the error visible in the console for debugging.
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF1F9] p-6 dark:bg-slate-900">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg dark:bg-slate-800">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-3xl dark:bg-red-500/20">
            ⚠️
          </div>
          <h1 className="mb-2 text-xl font-medium text-slate-900 dark:text-white">
            {this.state.isChunkError
              ? "A new version was deployed"
              : "Something went wrong"}
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {this.state.isChunkError
              ? "The app was updated while you were using it. Please reload to get the latest version."
              : "An unexpected error occurred. Reloading usually fixes it."}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="btn btn-dark block w-full text-center"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

