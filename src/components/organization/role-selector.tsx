import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoleBadge } from "./role-badge";
import type { OrganizationRole } from "@/interfaces";
import { 
  getAssignableRoles, 
  getRoleDisplayName, 
  getRoleDescription,
  canChangeUserRole
} from "@/lib/role-permissions";

interface RoleSelectorProps {
  currentUserRole: OrganizationRole;
  targetUserRole: OrganizationRole;
  targetUserName: string;
  targetUserEmail: string;
  onRoleChange: (newRole: OrganizationRole) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function RoleSelector({
  currentUserRole,
  targetUserRole,
  targetUserName,
  targetUserEmail,
  onRoleChange,
  isOpen,
  onClose,
}: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<OrganizationRole>(targetUserRole);
  const [isLoading, setIsLoading] = useState(false);

  const assignableRoles = getAssignableRoles(currentUserRole);
  const canChange = canChangeUserRole(currentUserRole, targetUserRole, selectedRole);
  const hasChanges = selectedRole !== targetUserRole;

  const handleConfirm = async () => {
    if (!hasChanges || !canChange) return;

    setIsLoading(true);
    try {
      await onRoleChange(selectedRole);
      onClose();
    } catch (error) {
      console.error("Failed to change role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRole(targetUserRole); // Reset to original role
    onClose();
  };

  const isRoleDowngrade = () => {
    const roleHierarchy = { MEMBER: 1, ADMIN: 2, OWNER: 3, SUPER_OWNER: 4 };
    return roleHierarchy[selectedRole] < roleHierarchy[targetUserRole];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Modify the role for <strong>{targetUserName || targetUserEmail}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Role</label>
            <div className="flex items-center gap-2">
              <RoleBadge role={targetUserRole} size="md" />
              <span className="text-sm text-muted-foreground">
                {getRoleDescription(targetUserRole)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">New Role</label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as OrganizationRole)}
            >
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={selectedRole} size="sm" />
                    <span>{getRoleDisplayName(selectedRole)}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {/* Include current role even if not in assignable roles */}
                {!assignableRoles.includes(targetUserRole) && (
                  <SelectItem value={targetUserRole}>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={targetUserRole} size="sm" />
                      <div>
                        <div>{getRoleDisplayName(targetUserRole)}</div>
                        <div className="text-xs text-muted-foreground">Current role</div>
                      </div>
                    </div>
                  </SelectItem>
                )}
                
                {assignableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={role} size="sm" />
                      <div>
                        <div>{getRoleDisplayName(role)}</div>
                        <div className="text-xs text-muted-foreground">
                          {getRoleDescription(role)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasChanges && isRoleDowngrade() && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-800">
              <div className="flex items-start gap-2">
                <div className="text-amber-600 text-sm">
                  ⚠️ <strong>Role Downgrade:</strong> This user will lose some permissions.
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasChanges || !canChange || isLoading}
          >
            {isLoading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}