import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, Users } from "lucide-react";

interface OrganizationDetailsProps {
  organizationName: string;
  inviterName: string;
  role: string;
  teamSize: number;
}

export function OrganizationDetails({
  organizationName,
  inviterName,
  role,
  teamSize,
}: OrganizationDetailsProps) {
  return (
    <>
      <CardHeader className="text-center pb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/5 rounded-lg mb-3 mx-auto">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-xl">{organizationName}</CardTitle>
        <CardDescription>
          {inviterName} has invited you to join their organization
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Role</span>
            </div>
            <Badge variant="secondary">{role}</Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Team Size</span>
            </div>
            <span className="text-sm text-muted-foreground">{teamSize} members</span>
          </div>
        </div>
      </CardContent>
    </>
  );
}