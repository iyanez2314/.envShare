import { Badge } from "@/components/ui/badge";
import { Crown, Eye } from "lucide-react";

interface RoleBadgeProps {
  role: string;
  className?: string;
}

function getRoleBadgeVariant(role: string) {
  switch (role.toUpperCase()) {
    case "OWNER":
      return "destructive";
    case "MEMBER":
      return "secondary";
    default:
      return "secondary";
  }
}

function getRoleIcon(role: string) {
  switch (role.toUpperCase()) {
    case "OWNER":
      return <Crown className="h-3 w-3" />;
    case "MEMBER":
      return <Eye className="h-3 w-3" />;
    default:
      return <Eye className="h-3 w-3" />;
  }
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge 
      variant={getRoleBadgeVariant(role)} 
      className={`flex items-center gap-1 ${className || ''}`}
    >
      {getRoleIcon(role)}
      {role}
    </Badge>
  );
}