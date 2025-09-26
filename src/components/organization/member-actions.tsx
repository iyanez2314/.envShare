import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, UserMinus, Settings, Crown } from "lucide-react";
import { RoleSelector } from "./role-selector";
import type { OrganizationRole } from "@/interfaces";
import {
  canRemoveUser,
  canChangeUserRole,
  getRoleDisplayName,
  isPrivilegedRole,
} from "@/lib/role-permissions";

interface MemberActionsProps {
  currentUserRole: OrganizationRole;
  targetUserRole: OrganizationRole;
  targetUserId: number;
  targetUserName: string;
  targetUserEmail: string;
  isCurrentUser?: boolean;
  onRoleChange: (userId: number, newRole: OrganizationRole) => Promise<void>;
  onRemoveUser: (userId: number) => Promise<void>;
  onTransferOwnership?: (userId: number) => Promise<void>;
}

export function MemberActions({
  currentUserRole,
  targetUserRole,
  targetUserId,
  targetUserName,
  targetUserEmail,
  isCurrentUser = false,
  onRoleChange,
  onRemoveUser,
  onTransferOwnership,
}: MemberActionsProps) {
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canRemove =
    !isCurrentUser && canRemoveUser(currentUserRole, targetUserRole);
  const canChangeRole =
    !isCurrentUser &&
    canChangeUserRole(currentUserRole, targetUserRole, targetUserRole);
  const canTransfer =
    currentUserRole === "SUPER_OWNER" && !isCurrentUser && onTransferOwnership;

  // If no actions are available, don't render the menu
  if (!canRemove && !canChangeRole && !canTransfer) {
    return null;
  }

  const handleRoleChange = async (newRole: OrganizationRole) => {
    await onRoleChange(targetUserId, newRole);
    setShowRoleSelector(false);
  };

  const handleRemoveUser = async () => {
    setIsLoading(true);
    try {
      await onRemoveUser(targetUserId);
      setShowRemoveDialog(false);
    } catch (error) {
      console.error("Failed to remove user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!onTransferOwnership) return;

    setIsLoading(true);
    try {
      await onTransferOwnership(targetUserId);
      setShowTransferDialog(false);
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canChangeRole && (
            <DropdownMenuItem onClick={() => setShowRoleSelector(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Change Role
            </DropdownMenuItem>
          )}

          {canTransfer && (
            <DropdownMenuItem onClick={() => setShowTransferDialog(true)}>
              <Crown className="mr-2 h-4 w-4" />
              Transfer Super Ownership
            </DropdownMenuItem>
          )}

          {(canRemove || canTransfer) && canChangeRole && (
            <DropdownMenuSeparator />
          )}

          {canRemove && (
            <DropdownMenuItem
              onClick={() => setShowRemoveDialog(true)}
              className="text-destructive focus:text-destructive"
            >
              <UserMinus className="mr-2 h-4 w-4" />
              Remove from Organization
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Selector Dialog */}
      <RoleSelector
        currentUserRole={currentUserRole}
        targetUserRole={targetUserRole}
        targetUserName={targetUserName}
        targetUserEmail={targetUserEmail}
        onRoleChange={handleRoleChange}
        isOpen={showRoleSelector}
        onClose={() => setShowRoleSelector(false)}
      />

      {/* Remove User Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{targetUserName || targetUserEmail}</strong> from this
              organization?
              {isPrivilegedRole(targetUserRole) && (
                <div className="mt-2 text-amber-600 dark:text-amber-400">
                  ⚠️ This user has {getRoleDisplayName(targetUserRole)}{" "}
                  privileges and will lose access to all organization resources.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveUser}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Removing..." : "Remove User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Transfer Ownership Dialog */}
      {canTransfer && (
        <AlertDialog
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Transfer Super Ownership</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to transfer super ownership to{" "}
                <strong>{targetUserName || targetUserEmail}</strong>?
                <div className="mt-2 space-y-1 text-sm">
                  <div className="text-amber-600 dark:text-amber-400">
                    ⚠️ <strong>This action cannot be undone.</strong>
                  </div>
                  <div>• You will become a regular Owner</div>
                  <div>• They will have full control over the organization</div>
                  <div>• They can remove you or change your role</div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleTransferOwnership}
                disabled={isLoading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isLoading ? "Transferring..." : "Transfer Ownership"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

