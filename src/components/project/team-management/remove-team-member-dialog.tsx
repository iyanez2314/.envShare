import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";

interface Member {
  id: number;
  name: string | null;
  email: string;
  role: string;
}

interface RemoveTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  projectName: string;
  onConfirm: (userId: number) => void;
  isLoading?: boolean;
}

export function RemoveTeamMemberDialog({
  open,
  onClose,
  member,
  projectName,
  onConfirm,
  isLoading = false,
}: RemoveTeamMemberDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Remove Team Member</DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Member Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {member.name?.substring(0, 2)?.toUpperCase() || 
                 member.email.substring(0, 2)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {member.name || "No Name"}
              </div>
              <div className="text-sm text-muted-foreground">
                {member.email}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              Are you sure you want to remove{" "}
              <span className="font-medium">{member.name || member.email}</span>{" "}
              from <span className="font-medium">{projectName}</span>?
            </p>
            <p className="text-muted-foreground">
              They will lose access to this project and all its resources, including environment variables and project settings.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(member.id)}
            disabled={isLoading}
          >
            {isLoading ? "Removing..." : "Remove Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}