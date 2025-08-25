import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GitBranch } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import { isUserAuthedFn } from "@/server-functions/_index";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayoutComponent,
  beforeLoad: async () => {
    const isAuthed = await isUserAuthedFn();
  },
});

function DashboardLayoutComponent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-6 w-6 text-accent" />
                <h1 className="text-xl font-semibold text-card-foreground">
                  .envShare
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
