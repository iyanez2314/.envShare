import { Users } from "lucide-react";

export function InvitationHeader() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
        <Users className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Organization Invitation
      </h1>
      <p className="text-muted-foreground">
        You've been invited to join an organization
      </p>
    </div>
  );
}