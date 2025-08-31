import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { RoleBadge } from "./role-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Invitation } from "./invitations-table";
import { useState } from "react";
import { OrganizationRole } from "@prisma/client";

interface InvitationRowProps {
  invitation: Invitation;
  onResend?: (invitationId: string | number) => void;
  onRoleChange?: (
    invitationId: string | number,
    newRole: OrganizationRole,
  ) => void;
  onCancel?: (invitationId: string | number) => void;
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

export function InvitationRow({
  invitation,
  onResend,
  onRoleChange,
  onCancel,
}: InvitationRowProps) {
  const [editingRole, setEditingRole] = useState(false);

  const handleRoleChange = (newRole: OrganizationRole) => {
    onRoleChange?.(invitation.id, newRole);
    setEditingRole(false);
  };

  return (
    <TableRow
      key={invitation.id}
      className={cn({
        "opacity-50": invitation.status.toLowerCase() === "declined",
      })}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Mail className="h-4 w-4" />
          </div>
          <div className="font-medium">{invitation.email}</div>
        </div>
      </TableCell>
      <TableCell>
        {editingRole ? (
          <Select value={invitation.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="OWNER">Owner</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={invitation.role} />
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {invitation.inviter
          ? invitation.inviter.name || invitation.inviter.email
          : "System"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {invitation.status === "Pending" && (
            <Clock className="h-3 w-3 text-muted-foreground" />
          )}
          <Badge variant={getStatusBadgeVariant(invitation.status)}>
            {invitation.status}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(invitation.createdAt.toISOString()).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onResend?.(invitation.id)}>
              Resend invitation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingRole(true)}>
              Change role
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onCancel?.(invitation.id)}
            >
              Cancel invitation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
