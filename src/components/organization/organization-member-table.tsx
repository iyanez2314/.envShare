import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import type { Organization } from "@/interfaces";
import {
  InviteUserDialog,
  TeamManagementTabs,
  MembersTable,
  InvitationsTable
} from "./team-management";

interface OrganizationMembersTableProps {
  organization: Organization;
  currentUserId: number | null;
  onUpdate: (organization: Organization) => void;
  onClose: () => void;
}

export function OrganizationMembersTable({
  organization,
  currentUserId,
}: OrganizationMembersTableProps) {
  const [activeTab, setActiveTab] = useState("members");
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Get organization members with their roles
  const members =
    organization.users?.map((user) => {
      const userRole = organization.userRoles?.find(
        (ur) => ur.userId === user.id,
      );
      const isOwner = organization.ownerId === user.id;

      return {
        id: user.id,
        name: user.name || "No Name",
        email: user.email,
        role: isOwner ? "OWNER" : userRole?.role || "MEMBER",
        status: "Active",
        joinedAt: user.createdAt,
      };
    }) || [];

  // Placeholder for invitations - will be implemented later
  const invitations: any[] = [];

  const handleInviteUser = (data: {
    email: string;
    role: "OWNER" | "MEMBER";
  }) => {
    // TODO: Implement invite logic
    console.log("Inviting user:", data);

    // Close modal
    setShowInviteModal(false);
  };

  const handleRoleChange = (memberId: number) => {
    // TODO: Implement role change logic
    console.log("Changing role for member:", memberId);
  };

  const handleRemoveMember = (memberId: number) => {
    // TODO: Implement remove member logic
    console.log("Removing member:", memberId);
  };

  const handleResendInvitation = (invitationId: string | number) => {
    // TODO: Implement resend invitation logic
    console.log("Resending invitation:", invitationId);
  };

  const handleChangeInvitationRole = (invitationId: string | number) => {
    // TODO: Implement change invitation role logic
    console.log("Changing invitation role:", invitationId);
  };

  const handleCancelInvitation = (invitationId: string | number) => {
    // TODO: Implement cancel invitation logic
    console.log("Canceling invitation:", invitationId);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-muted-foreground">
          View and manage organization members and pending invitations
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TeamManagementTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          membersCount={members.length}
          invitationsCount={invitations.length}
        />

        <MembersTable
          members={members}
          currentUserId={currentUserId}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
        />

        <InvitationsTable
          invitations={invitations}
          onInviteUser={() => setShowInviteModal(true)}
          onResendInvitation={handleResendInvitation}
          onChangeInvitationRole={handleChangeInvitationRole}
          onCancelInvitation={handleCancelInvitation}
        />
      </Tabs>

      <InviteUserDialog
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        organizationName={organization.name}
        onInvite={handleInviteUser}
      />
    </div>
  );
}
