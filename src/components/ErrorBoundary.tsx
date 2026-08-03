import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const CHUNK_RELOAD_KEY = "courtava_chunk_reload_attempted";

function isChunkLoadError(error: Error) {
  return /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i.test(
    error.message
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo);

    if (isChunkLoadError(error)) {
      let hasReloaded = false;

      try {
        hasReloaded = sessionStorage.getItem(CHUNK_RELOAD_KEY) === "true";
      } catch {
        /* ignore */
      }

      if (!hasReloaded) {
        try {
          sessionStorage.setItem(CHUNK_RELOAD_KEY, "true");
        } catch {
          /* ignore */
        }
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-4">
          <h1 className="text-lg font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            {this.state.error?.message}
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
