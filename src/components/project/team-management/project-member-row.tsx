import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Crown, Settings, Eye } from "lucide-react";
import type { ProjectRole } from "@/interfaces";

interface TeamMember {
  id: number;
  name: string | null;
  email: string;
  role: ProjectRole;
  addedAt: Date;
}

interface ProjectMemberRowProps {
  member: TeamMember;
  currentUserId: number | null;
  projectOwnerId: number;
  canEdit: boolean;
  onRoleChange: (userId: number, newRole: ProjectRole) => void;
  onRemove: (member: TeamMember) => void;
}

export function ProjectMemberRow({
  member,
  currentUserId,
  projectOwnerId,
  canEdit,
  onRoleChange,
  onRemove,
}: ProjectMemberRowProps) {
  const [editingRole, setEditingRole] = useState(false);
  const isCurrentUser = member.id === currentUserId;
  const isProjectOwner = member.id === projectOwnerId;

  const handleRoleChange = (newRole: ProjectRole) => {
    onRoleChange(member.id, newRole);
    setEditingRole(false);
  };

  const getRoleIcon = (role: ProjectRole) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-3 w-3" />;
      case "EDITOR":
        return <Settings className="h-3 w-3" />;
      case "VIEWER":
        return <Eye className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: ProjectRole) => {
    switch (role) {
      case "OWNER":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "EDITOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {member.name?.substring(0, 2)?.toUpperCase() ||
                member.email.substring(0, 2)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {member.name || "No Name"}
              {isCurrentUser && (
                <Badge variant="outline" className="ml-2 text-xs">
                  You
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{member.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {editingRole && canEdit && !isProjectOwner ? (
          <Select value={member.role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VIEWER">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  Viewer
                </div>
              </SelectItem>
              <SelectItem value="EDITOR">
                <div className="flex items-center gap-2">
                  <Settings className="h-3 w-3" />
                  Editor
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge
            variant="outline"
            className={`flex items-center gap-1 w-fit ${getRoleColor(member.role)}`}
          >
            {getRoleIcon(member.role)}
            {member.role}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {member?.addedAt?.toLocaleDateString() || "N/A"}
        </div>
      </TableCell>
      <TableCell>
        {canEdit && !isCurrentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!isProjectOwner && (
                <DropdownMenuItem onClick={() => setEditingRole(true)}>
                  Change Role
                </DropdownMenuItem>
              )}
              {!isProjectOwner && (
                <DropdownMenuItem
                  onClick={() => onRemove(member)}
                  className="text-destructive"
                >
                  Remove from Project
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}

