import { Badge } from "@/components/ui/badge";
import { Crown, Shield, UserCheck, User } from "lucide-react";
import type { OrganizationRole } from "@/interfaces";
import { getRoleDisplayName, getRoleBadgeVariant } from "@/lib/role-permissions";

interface RoleBadgeProps {
  role: OrganizationRole;
  size?: "sm" | "md";
  showIcon?: boolean;
}

export function RoleBadge({ role, size = "sm", showIcon = true }: RoleBadgeProps) {
  const variant = getRoleBadgeVariant(role);
  const displayName = getRoleDisplayName(role);

  const getIcon = () => {
    if (!showIcon) return null;
    
    const iconClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";
    
    switch (role) {
      case "SUPER_OWNER":
        return <Crown className={`${iconClass} text-yellow-600`} />;
      case "OWNER":
        return <Shield className={`${iconClass} text-blue-600`} />;
      case "ADMIN":
        return <UserCheck className={`${iconClass} text-green-600`} />;
      case "MEMBER":
        return <User className={`${iconClass} text-gray-600`} />;
      default:
        return <User className={`${iconClass} text-gray-600`} />;
    }
  };

  const getBadgeStyles = () => {
    const baseStyles = "flex items-center gap-1 font-medium";
    
    switch (role) {
      case "SUPER_OWNER":
        return `${baseStyles} bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 dark:from-yellow-900/20 dark:to-amber-900/20 dark:text-yellow-200 dark:border-yellow-600`;
      case "OWNER":
        return `${baseStyles} bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-300 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-200 dark:border-blue-600`;
      case "ADMIN":
        return `${baseStyles} bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-200 dark:border-green-600`;
      case "MEMBER":
        return `${baseStyles} bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600`;
      default:
        return baseStyles;
    }
  };

  return (
    <Badge 
      variant={variant} 
      className={getBadgeStyles()}
    >
      {getIcon()}
      <span>{displayName}</span>
    </Badge>
  );
}