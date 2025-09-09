import { createFileRoute } from "@tanstack/react-router";
import {
  EmailSettings,
  ChangePassword,
  DeleteAccount,
  SubscriptionSection,
} from "@/components/settings";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/dashboard/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security settings
        </p>
      </div>

      <div className="space-y-8">
        <div className="border-t pt-8 space-y-6">
          <EmailSettings currentEmail={user?.email || ""} />
          <ChangePassword />
          <SubscriptionSection currentPlanId="free" />
          <DeleteAccount userEmail={user?.email || ""} />
        </div>
      </div>
    </div>
  );
}
