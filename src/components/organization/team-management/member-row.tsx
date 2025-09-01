import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { MemberAvatar } from "./member-avatar";
import { RoleBadge } from "./role-badge";
import { MemberActionsMenu } from "./member-actions-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { OrganizationRole } from "@prisma/client";

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
  onRoleChange?: (memberId: number, newRole: OrganizationRole) => void;
  onRemove?: (memberId: number) => void;
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
  onRoleChange,
  onRemove,
}: MemberRowProps) {
  const [editingRole, setEditingRole] = useState(false);

  const handleRoleChange = (newRole: OrganizationRole) => {
    onRoleChange?.(member.id, newRole);
    setEditingRole(false);
  };

  return (
    <TableRow key={member.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <MemberAvatar name={member.name} email={member.email} />
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">
              {member.email}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {editingRole ? (
          <Select 
            value={member.role} 
            onValueChange={handleRoleChange}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={member.role} />
        )}
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
        <MemberActionsMenu
          member={member}
          currentUserId={currentUserId}
          onRoleChange={() => setEditingRole(true)}
          onRemove={onRemove}
        />
      </TableCell>
    </TableRow>
  );
}