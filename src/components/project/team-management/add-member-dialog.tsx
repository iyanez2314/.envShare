import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Settings, Eye } from "lucide-react";
import type { ProjectRole } from "@/interfaces";

interface Member {
  id: number;
  name: string | null;
  email: string;
}

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  projectName: string;
  onAdd: (member: Member, role: ProjectRole) => void;
  isLoading?: boolean;
}

export function AddMemberDialog({
  open,
  onClose,
  member,
  projectName,
  onAdd,
  isLoading = false,
}: AddMemberDialogProps) {
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("VIEWER");

  if (!member) return null;

  const handleAdd = () => {
    onAdd(member, selectedRole);
  };

  const getRoleDescription = (role: ProjectRole) => {
    switch (role) {
      case "EDITOR":
        return "Can view, edit, and manage project settings and environment variables";
      case "VIEWER":
        return "Can only view project details and environment variables";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
              <UserPlus className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription className="mt-1">
                Add member to <strong>{projectName}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Member Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
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

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Project Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as ProjectRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIEWER">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-muted-foreground">Read-only access</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="EDITOR">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Editor</div>
                      <div className="text-xs text-muted-foreground">Can edit and manage</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getRoleDescription(selectedRole)}
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
            onClick={handleAdd}
            disabled={isLoading}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {isLoading ? "Adding..." : "Add Member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}