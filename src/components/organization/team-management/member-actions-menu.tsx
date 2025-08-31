import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface Member {
  id: number;
  role: string;
  name: string;
  email: string;
}

interface MemberActionsMenuProps {
  member: Member;
  currentUserId: number | null;
  onRoleChange?: (memberId: number) => void;
  onRemove?: (memberId: number) => void;
}

export function MemberActionsMenu({
  member,
  currentUserId,
  onRoleChange,
  onRemove,
}: MemberActionsMenuProps) {
  const isCurrentUser = member.id === currentUserId;
  const isOwner = member.role === "OWNER";
  const canModify = !isOwner && !isCurrentUser;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem 
          disabled={!canModify}
          onClick={() => canModify && onRoleChange?.(member.id)}
        >
          Change role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive"
          disabled={!canModify}
          onClick={() => canModify && onRemove?.(member.id)}
        >
          Remove member
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}