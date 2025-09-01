import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { InvitationRow } from "./invitation-row";
import type { User } from "@/interfaces";
import { OrganizationRole } from "@prisma/client";

export interface Invitation {
  id: string | number;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  inviter: {
    id: string | number;
    name: string | null;
    email: string | null;
  } | null;
}

interface InvitationsTableProps {
  invitations: Invitation[];
  onInviteUser: () => void;
  onResendInvitation: (invitationId: string | number) => void;
  onChangeInvitationRole: (
    invitationId: string,
    newRole: OrganizationRole,
  ) => void;
  onCancelInvitation: (invitationId: string | number) => void;
}

export function InvitationsTable({
  invitations,
  onInviteUser,
  onResendInvitation,
  onChangeInvitationRole,
  onCancelInvitation,
}: InvitationsTableProps) {
  return (
    <TabsContent value="invitations" className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Send invitations to add new members to this organization
        </div>
        <Button
          onClick={onInviteUser}
          size="sm"
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <InvitationRow
                key={invitation.id}
                invitation={invitation}
                onResend={onResendInvitation}
                onRoleChange={onChangeInvitationRole}
                onCancel={onCancelInvitation}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </TabsContent>
  );
}
