import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Crown, Users } from "lucide-react";

interface AvailableMember {
  id: number;
  name: string | null;
  email: string;
  organizationRole: "OWNER" | "MEMBER";
  joinedAt: Date;
}

interface AvailableMemberRowProps {
  member: AvailableMember;
  onAdd: (member: AvailableMember) => void;
}

export function AvailableMemberRow({ member, onAdd }: AvailableMemberRowProps) {
  const getOrgRoleIcon = (role: "OWNER" | "MEMBER") => {
    return role === "OWNER" ? (
      <Crown className="h-3 w-3" />
    ) : (
      <Users className="h-3 w-3" />
    );
  };

  const getOrgRoleColor = (role: "OWNER" | "MEMBER") => {
    return role === "OWNER"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
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
            <div className="font-medium">{member.name || "No Name"}</div>
            <div className="text-sm text-muted-foreground">{member.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={`flex items-center gap-1 w-fit ${getOrgRoleColor(member.organizationRole)}`}
        >
          {getOrgRoleIcon(member.organizationRole)}
          {member.organizationRole}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {member?.joinedAt?.toLocaleDateString() || "N/A"}
        </div>
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          onClick={() => onAdd(member)}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </TableCell>
    </TableRow>
  );
}

