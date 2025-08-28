import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Users } from "lucide-react";
import type { Organization, TeamMember, User } from "@/interfaces";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrganizationFormProps {
  organization?: Organization;
  status?: "idle" | "pending" | "success" | "error";
  onSubmit: (
    data: Omit<Organization, "id" | "createdAt" | "teamMembers" | "ownerId">,
    teamMembers?: User[],
  ) => void;
  onClose: () => void;
}

export function OrganizationForm({
  organization,
  error,
  onSubmit,
  status = "idle",
  onClose,
}: OrganizationFormProps) {
  const [formData, setFormData] = useState({
    name: organization?.name || "",
    description: organization?.description || "",
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    organization?.users?.filter((member) => member.role !== "owner") || [],
  );
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"owner" | "member">(
    "member",
  );

  const addTeamMember = () => {
    if (!newMemberEmail.trim()) return;

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      email: newMemberEmail.trim(),
      role: newMemberRole,
      addedAt: new Date().toISOString(),
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setNewMemberEmail("");
    setNewMemberRole("member");
  };

  const removeMember = (memberId: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit(formData, teamMembers);
  };

  const renderButtonText = () => {
    if (status === "pending") {
      return organization ? (
        <>
          <LoaderIcon className="mr-2 size-4 animate-spin" />
          <p> Updating... </p>
        </>
      ) : (
        <>
          <LoaderIcon className="mr-2 size-4 animate-spin" />
          <p> Creating... </p>
        </>
      );
    }

    if (status === "error") {
      return organization ? "Retry Update" : "Retry Create";
    }

    return organization ? "Update Organization" : "Create Organization";
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-popover text-popover-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {organization ? "Edit Organization" : "Create New Organization"}
          </DialogTitle>
          <DialogDescription>
            {organization
              ? "Update your organization details and manage team members."
              : "Create a new organization and invite team members to collaborate."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Organization Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="My Company"
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of your organization..."
                rows={3}
                className="bg-input border-border resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-medium text-foreground">
                Team Members
              </h3>
            </div>

            {/* Add new member */}
            <div className="flex gap-2">
              <Input
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="Enter email address"
                className="bg-input border-border flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTeamMember();
                  }
                }}
              />
              <Select
                value={newMemberRole}
                onValueChange={(value: "owner" | "member") =>
                  setNewMemberRole(value)
                }
              >
                <SelectTrigger className="w-32 bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={addTeamMember} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Current team members */}
            {teamMembers.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Team Members ({teamMembers.length})
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{member.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={!formData.name.trim() || status === "pending"}
              type="submit"
              className={cn(
                "bg-primary text-primary-foreground hover:bg-primary/90",
                {
                  "opacity-70 cursor-not-allowed": status === "pending",
                  "bg-red-600 hover:bg-red-700": status === "error",
                },
              )}
            >
              {renderButtonText()}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
