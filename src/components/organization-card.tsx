import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { OrganizationTeamDialog } from "@/components/organization-team-dialog";
import type { Organization } from "@/interfaces";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface OrganizationCardProps {
  organization: Organization;
  projectCount: number;
  currentUserId: number | null;
  onEdit: (org: Organization) => void;
  onDelete: (orgId: string | number) => void;
  onUpdate: (org: Organization) => void;
  disableCardInteraction?: boolean;
}

export function OrganizationCard({
  organization,
  projectCount,
  currentUserId,
  onEdit,
  disableCardInteraction = false,
  onDelete,
  onUpdate,
}: OrganizationCardProps) {
  const navigate = useNavigate();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTeamDialog, setShowTeamDialog] = useState(false);

  const isOwner = organization.ownerId === currentUserId;
  const userRole =
    organization.userRoles?.find((ur) => ur.userId === currentUserId)?.role ||
    (isOwner ? "OWNER" : null);

  // Handle card click to navigate to organization details

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on dropdown menu
    if ((e.target as HTMLElement).closest("[data-dropdown-trigger]")) {
      return;
    }
    navigate({
      to: "/dashboard/organization/$id",
      params: { id: organization.id.toString() },
    });
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "h-full p-6 rounded-lg border border-border bg-card hover:bg-accent/50 cursor-pointer transition-colors relative",
          {
            "pointer-events-none opacity-50": disableCardInteraction,
          },
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{projectCount} projects</Badge>
            {(isOwner || userRole === "OWNER") && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  data-dropdown-trigger
                  disabled={disableCardInteraction}
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation(); // prevent event bubbling to card click
                      onEdit(organization);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation(); // prevent event bubbling to card click
                      setShowTeamDialog(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Manage Team
                  </DropdownMenuItem>
                  {isOwner && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation(); // prevent event bubbling to card click
                        setShowDeleteDialog(true);
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-lg mb-2">{organization.name}</h3>
        {organization.description && (
          <p className="text-muted-foreground text-sm mb-4">
            {organization.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{organization.users?.length || 0} members</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {userRole || "MEMBER"}
          </Badge>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{organization.name}"? This will
              also delete all projects within this organization. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(organization.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showTeamDialog && (
        <OrganizationTeamDialog
          organization={organization}
          onUpdate={onUpdate}
          onClose={() => setShowTeamDialog(false)}
        />
      )}
    </>
  );
}
