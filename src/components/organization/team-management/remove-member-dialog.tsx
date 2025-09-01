import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface RemoveMemberDialogProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onConfirm: (memberId: number) => void;
  isLoading?: boolean;
}

export function RemoveMemberDialog({
  open,
  onClose,
  member,
  onConfirm,
  isLoading = false,
}: RemoveMemberDialogProps) {
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
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <span className="font-medium text-foreground">{member.name}</span>{" "}
            ({member.email}) from this organization?
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            They will lose access to all projects and data within this organization.
          </p>
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