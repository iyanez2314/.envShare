import {
  createFileRoute,
  Outlet,
  redirect,
  useRouteContext,
} from "@tanstack/react-router";
import { Navigation } from "@/components/layout/navigation";
import { validateIncomingRequestFn } from "@/server-functions";
import { Suspense } from "react";
import { LoadingAnimation } from "@/components/shared/loading-animation";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayoutComponent,
  beforeLoad: async () => {
    const result = await validateIncomingRequestFn();

    if (!result.valid) {
      throw redirect({
        to: "/",
        search: {
          redirect: "/dashboard",
        },
      });
    }

    return {
      user: result.user,
    };
  },
});

function DashboardLayoutComponent() {
  const context = useRouteContext({ from: "/dashboard" });
  const user = context.user;

  const currentUser = user
    ? {
        name: user.name ?? undefined,
        email: user.email,
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        isAuthenticated={true}
        currentUser={currentUser}
        showGetStarted={false}
      />

      <main className="container mx-auto px-6 py-8">
        <Suspense fallback={<LoadingAnimation />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
