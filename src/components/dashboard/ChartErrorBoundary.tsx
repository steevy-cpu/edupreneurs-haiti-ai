import { Component, ReactNode, ErrorInfo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackHeight?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Chart-specific error boundary that catches errors from chart components
 * without crashing the entire Dashboard. Provides a retry button.
 */
export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ChartErrorBoundary] Chart rendering failed:", error);
    console.error("[ChartErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card className="border-none rounded-xl shadow-md">
          <CardContent 
            className="flex flex-col items-center justify-center gap-4 py-8"
            style={{ minHeight: this.props.fallbackHeight || 250 }}
          >
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-foreground">
                Impossible de charger le graphique
              </p>
              <p className="text-sm text-muted-foreground">
                Une erreur s'est produite lors du rendu
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={this.handleRetry}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
