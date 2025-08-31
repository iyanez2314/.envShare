import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Mail, Crown, Edit, Eye } from "lucide-react";
import type { Project, TeamMember } from "@/interfaces";

interface TeamMembersDialogProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onClose: () => void;
}

export function TeamMembersDialog({
  project,
  onUpdate,
  onClose,
}: TeamMembersDialogProps) {
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"editor" | "viewer">(
    "viewer",
  );

  const addTeamMember = () => {
    if (!newMemberEmail.trim()) return;

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      addedAt: new Date().toISOString(),
    };

    const updatedProject = {
      ...project,
      teamMembers: [...project.teamMembers, newMember],
    };

    onUpdate(updatedProject);
    setNewMemberEmail("");
    setNewMemberRole("viewer");
  };

  const removeMember = (memberId: string) => {
    const updatedProject = {
      ...project,
      teamMembers: project.teamMembers.filter(
        (member) => member.id !== memberId,
      ),
    };
    onUpdate(updatedProject);
  };

  const updateMemberRole = (memberId: string, newRole: "editor" | "viewer") => {
    const updatedProject = {
      ...project,
      teamMembers: project.teamMembers.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member,
      ),
    };
    onUpdate(updatedProject);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />;
      case "editor":
        return <Edit className="h-3 w-3" />;
      case "viewer":
        return <Eye className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "editor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "viewer":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Team Members</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Member */}
          <div className="space-y-4 p-4 border border-border rounded-lg">
            <h3 className="font-medium">Invite Team Member</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teammate@example.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newMemberRole}
                  onValueChange={(value: "editor" | "viewer") =>
                    setNewMemberRole(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addTeamMember} disabled={!newMemberEmail.trim()}>
              <Plus className="size-4 mr-2 bg:text-primary-foreground" />
              Add Member
            </Button>
          </div>

          {/* Current Members */}
          <div className="space-y-4">
            <h3 className="font-medium">
              Team Members ({project.teamMembers.length})
            </h3>
            <div className="space-y-2">
              {project.teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-accent/10 p-2">
                      <Mail className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(member.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "owner" ? (
                      <Badge className={getRoleColor(member.role)}>
                        {getRoleIcon(member.role)}
                        <span className="ml-1">Owner</span>
                      </Badge>
                    ) : (
                      <Select
                        value={member.role}
                        onValueChange={(value: "editor" | "viewer") =>
                          updateMemberRole(member.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Descriptions */}
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">Role Permissions</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3" />
                <span>
                  <strong>Owner:</strong> Full access to project, team
                  management, and deletion
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Edit className="h-3 w-3" />
                <span>
                  <strong>Editor:</strong> Can view and edit project details and
                  environment variables
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>
                  <strong>Viewer:</strong> Can only view project details and
                  environment variables
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
