import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface InvitationActionsProps {
  invitationId: string;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function InvitationActions({
  invitationId,
  onAccept,
  onDecline,
}: InvitationActionsProps) {
  return (
    <>
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={onAccept}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Accept Invitation
        </Button>

        <Button variant="outline" className="w-full" size="lg" onClick={onDecline}>
          <XCircle className="w-4 h-4 mr-2" />
          Decline Invitation
        </Button>
      </div>

      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          Back to .envShare
        </Link>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-muted-foreground">
          Invitation ID: {invitationId}
        </p>
      </div>
    </>
  );
}