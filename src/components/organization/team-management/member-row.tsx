import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { MemberAvatar } from "./member-avatar";
import { RoleBadge as LegacyRoleBadge } from "./role-badge";
import { RoleBadge } from "../role-badge";
import { MemberActions } from "../member-actions";
import { MemberActionsMenu } from "./member-actions-menu";
import { useState } from "react";
import type { OrganizationRole } from "@/interfaces";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinedAt: Date;
}

interface MemberRowProps {
  member: Member;
  currentUserId: number | null;
  currentUserRole?: OrganizationRole;
  onRoleChange?: (memberId: number, newRole: OrganizationRole) => void;
  onRemove?: (memberId: number) => void;
  onTransferOwnership?: (memberId: number) => void;
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "pending":
      return "secondary";
    case "expired":
      return "destructive";
    default:
      return "secondary";
  }
}

export function MemberRow({
  member,
  currentUserId,
  currentUserRole = "MEMBER",
  onRoleChange,
  onRemove,
  onTransferOwnership,
}: MemberRowProps) {
  const isCurrentUser = member.id === currentUserId;
  const memberRole = member.role as OrganizationRole;

  const handleRoleChange = async (newRole: OrganizationRole) => {
    if (onRoleChange) {
      await onRoleChange(member.id, newRole);
    }
  };

  const handleRemove = async (memberId: number) => {
    if (onRemove) {
      await onRemove(memberId);
    }
  };

  const handleTransferOwnership = async (memberId: number) => {
    if (onTransferOwnership) {
      await onTransferOwnership(memberId);
    }
  };

  return (
    <TableRow key={member.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <MemberAvatar name={member.name} email={member.email} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{member.name}</span>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">
                  You
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {member.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <RoleBadge role={memberRole} size="md" />
      </TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant(member.status)}>
          {member.status}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(member.joinedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <MemberActions
          currentUserRole={currentUserRole}
          targetUserRole={memberRole}
          targetUserId={member.id}
          targetUserName={member.name}
          targetUserEmail={member.email}
          isCurrentUser={isCurrentUser}
          onRoleChange={handleRoleChange}
          onRemoveUser={handleRemove}
          onTransferOwnership={handleTransferOwnership}
        />
      </TableCell>
    </TableRow>
  );
}