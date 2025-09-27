import { Card, CardContent } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { InvitationHeader } from "@/components/invitation/invitation-header";
import { OrganizationDetails } from "@/components/invitation/organization-details";
import { AccessBenefits } from "@/components/invitation/access-benefits";
import { InvitationActions } from "@/components/invitation/invitation-actions";

export const Route = createFileRoute("/invite/$invitationId")({
  component: InvitationPage,
});

export default function InvitationPage() {
  const { invitationId } = Route.useParams();

  const handleAccept = () => {
    console.log("Accepting invitation:", invitationId);
  };

  const handleDecline = () => {
    console.log("Declining invitation:", invitationId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <InvitationHeader />

        <Card className="shadow-lg border-2">
          <OrganizationDetails
            organizationName="TechCorp Organization"
            inviterName="John Doe"
            role="Developer"
            teamSize={15}
          />

          <CardContent className="space-y-2">
            <AccessBenefits />

            <InvitationActions
              invitationId={invitationId}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

