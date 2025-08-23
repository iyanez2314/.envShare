import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Folder,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Users,
} from "lucide-react";
import type { Project } from "@/interfaces";
import { EnvVarsDialog } from "./env-vars-dialog";
import { TeamMembersDialog } from "./team-member-dialog";

interface ProjectCardProps {
  project: Project;
  currentUserId: string;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onUpdate: (project: Project) => void;
}

export function ProjectCard({
  project,
  currentUserId,
  onEdit,
  onDelete,
  onUpdate,
}: ProjectCardProps) {
  const [showEnvVars, setShowEnvVars] = useState(false);
  const [showTeamMembers, setShowTeamMembers] = useState(false);

  const envVarCount = Object.keys(project.envVars).length;
  const repoName =
    project.githubUrl.split("/").pop()?.replace(".git", "") || "Repository";

  const teamMembers = project.teamMembers || [];
  const currentUserMember = teamMembers.find(
    (member) =>
      member.id === currentUserId || member.email === "you@example.com",
  );
  const userRole =
    project.ownerId === currentUserId
      ? "owner"
      : currentUserMember?.role || "viewer";
  const canEdit = userRole === "owner" || userRole === "editor";
  const canDelete = userRole === "owner";
  const canManageTeam = userRole === "owner";

  return (
    <>
      <Card className="bg-card border-border hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2">
                <Folder className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg text-card-foreground">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {repoName}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="size-4 bg:text-primary-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="size-4 mr-2 bg:text-primary-foreground" />
                    Edit Project
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setShowEnvVars(true)}>
                  <Key className="size-4 mr-2 bg:text-primary-foreground" />
                  Environment Variables
                </DropdownMenuItem>
                {canManageTeam && (
                  <DropdownMenuItem onClick={() => setShowTeamMembers(true)}>
                    <Users className="simr-2 bg:text-primary-foreground" />
                    Manage Team
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(project.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {project.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                <Key className="h-3 w-3 mr-1" />
                {envVarCount} env vars
              </Badge>
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                <Users className="h-3 w-3 mr-1" />
                {teamMembers.length}{" "}
                {teamMembers.length === 1 ? "member" : "members"}
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Badge
                variant={userRole === "owner" ? "default" : "secondary"}
                className="text-xs"
              >
                {userRole}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(project.githubUrl, "_blank")}
                className="text-accent hover:text-accent-foreground hover:bg-accent/10"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showEnvVars && (
        <EnvVarsDialog
          project={project}
          canEdit={canEdit}
          onUpdate={onUpdate}
          onClose={() => setShowEnvVars(false)}
        />
      )}

      {showTeamMembers && (
        <TeamMembersDialog
          project={project}
          onUpdate={onUpdate}
          onClose={() => setShowTeamMembers(false)}
        />
      )}
    </>
  );
}
