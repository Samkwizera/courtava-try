import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BackendEnvErrorScreen() {
  const handleReload = () => {
    if (typeof window !== "undefined") window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Backend not ready</CardTitle>
          <CardDescription>
            The app couldn’t read its backend configuration (missing runtime env vars), so it can’t
            initialize yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={handleReload}>
            Reload
          </Button>
          <p className="text-sm text-muted-foreground">
            If Reload doesn’t fix it, use the preview refresh button (right panel) to fully reload
            the sandbox.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
