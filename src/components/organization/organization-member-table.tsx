import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import type { Organization } from "@/interfaces";
import {
  InviteUserDialog,
  TeamManagementTabs,
  MembersTable,
  InvitationsTable,
  RemoveMemberDialog,
} from "./team-management";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getOrganizationInvitationsFn,
  updateInvitedUserRoleChangeFn,
  cancelOrganizationInvitationFn,
} from "@/server-functions/invitation-functions";
import {
  updateOrganizationMemberRoleFn,
  removeOrganizationMemberFn,
} from "@/server-functions/organization-functions";
import { transferSuperOwnershipFn } from "@/server-functions/organization-functions/hierarchical-roles";
import { toast } from "sonner";
import { OrganizationRole } from "@prisma/client";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("members");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);

  const { data: invitationsResponse } = useSuspenseQuery({
    queryKey: ["organization-invitations", organization.id],
    queryFn: () =>
      getOrganizationInvitationsFn({ data: { orgId: organization.id } }),
  });

  const transferOwnershipMutation = useMutation({
    mutationFn: transferSuperOwnershipFn,
  });

  const updateInvitationRoleMutation = useMutation({
    mutationFn: updateInvitedUserRoleChangeFn,
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: cancelOrganizationInvitationFn,
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: updateOrganizationMemberRoleFn,
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeOrganizationMemberFn,
  });

  const invitations = invitationsResponse?.data || [];

  // Get current user's role in the organization
  const currentUserRole =
    organization.userRoles?.find((ur) => ur.userId === currentUserId)?.role ||
    "MEMBER";

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

  const handleInviteUser = (data: {
    email: string;
    role: OrganizationRole;
  }) => {
    // TODO: Implement invite logic
    console.log("Inviting user:", data);

    // Close modal
    setShowInviteModal(false);
  };

  const handleRoleChange = (memberId: number, newRole: OrganizationRole) => {
    toast.promise(
      updateMemberRoleMutation.mutateAsync({
        data: {
          memberId,
          newRole,
          orgId: organization.id,
        },
      }),
      {
        loading: "Updating member role...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["organizations"],
          });
          return "Member role updated successfully!";
        },
        error: "Failed to update member role",
      },
    );
  };

  const handleRemoveMember = (memberId: number) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setMemberToRemove(member);
    }
  };

  const confirmRemoveMember = (memberId: number) => {
    toast.promise(
      removeMemberMutation.mutateAsync({
        data: {
          memberId,
          orgId: organization.id,
        },
      }),
      {
        loading: "Removing member...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["organizations"],
          });
          setMemberToRemove(null);
          return "Member removed successfully!";
        },
        error: "Failed to remove member",
      },
    );
  };

  const handleResendInvitation = (invitationId: string | number) => {
    console.log("Resending invitation:", invitationId);
  };

  const handleTransferOwnership = (newOwnerId: number) => {
    toast.promise(
      transferOwnershipMutation.mutateAsync({
        data: {
          newSuperOwnerId: newOwnerId,
          organizationId: organization.id,
        },
      }),
      {
        loading: "Transferring ownership...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["organizations"],
          });
          return "Ownership transferred successfully!";
        },
        error: "Failed to transfer ownership, please try again later.",
      },
    );
  };

  const handleChangeInvitationRole = (
    invitationId: string,
    newRole: OrganizationRole,
  ) => {
    toast.promise(
      updateInvitationRoleMutation.mutateAsync({
        data: {
          invitationId: invitationId,
          updatedRole: newRole,
          orgId: organization.id,
        },
      }),
      {
        loading: "Updating invitation role...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["organization-invitations", organization.id],
          });
          return "Invitation role updated successfully!";
        },
        error: "Failed to update invitation role",
      },
    );
  };

  const handleCancelInvitation = (invitationId: string) => {
    toast.promise(
      cancelInvitationMutation.mutateAsync({
        data: {
          invitationId: String(invitationId),
          orgId: organization.id,
        },
      }),
      {
        loading: "Cancelling invitation...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["organization-invitations", organization.id],
          });
          return "Invitation cancelled successfully!";
        },
        error: "Failed to cancel invitation",
      },
    );
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
          currentUserRole={currentUserRole}
          onRoleChange={handleRoleChange}
          onRemoveMember={handleRemoveMember}
          onTransferOwnership={handleTransferOwnership}
        />

        <InvitationsTable
          invitations={invitations}
          currentUserRole={currentUserRole}
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
        currentUserRole={currentUserRole}
        onInvite={handleInviteUser}
      />

      <RemoveMemberDialog
        open={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        onConfirm={confirmRemoveMember}
        isLoading={removeMemberMutation.status === "pending"}
      />
    </div>
  );
}
