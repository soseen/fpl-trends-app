import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "@/components/ui/button";

export default class AnalysisErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("My Trends rendering failed", error, info.componentStack);
  }
  override render() {
    return this.state.failed ? (
      <div
        className="rounded-md border border-secondary bg-primary p-4 text-text"
        role="alert"
      >
        <p>This analysis could not be displayed. Your FPL ID is saved.</p>
        <Button className="mt-3" onClick={() => window.location.reload()}>
          Reload analysis
        </Button>
      </div>
    ) : (
      this.props.children
    );
  }
}
