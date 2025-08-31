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
import { Mail, Clock, MoreHorizontal } from "lucide-react";

interface Invitation {
  id: string | number;
  email: string;
  role: string;
  invitedBy: string;
  status: string;
  invitedAt: Date;
}

interface InvitationRowProps {
  invitation: Invitation;
  onResend?: (invitationId: string | number) => void;
  onRoleChange?: (invitationId: string | number) => void;
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
  return (
    <TableRow key={invitation.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Mail className="h-4 w-4" />
          </div>
          <div className="font-medium">{invitation.email}</div>
        </div>
      </TableCell>
      <TableCell>
        <RoleBadge role={invitation.role} />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {invitation.invitedBy}
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
        {new Date(invitation.invitedAt).toLocaleDateString()}
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
            <DropdownMenuItem onClick={() => onRoleChange?.(invitation.id)}>
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