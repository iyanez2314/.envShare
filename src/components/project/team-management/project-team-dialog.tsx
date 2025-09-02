import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Project } from "@/interfaces";
import {
  ProjectTeamTabs,
  CurrentTeamTable,
  AvailableMembersTable,
  AddMemberDialog,
  RemoveTeamMemberDialog,
} from "./";
import {
  useSuspenseQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getProjectTeamFn,
  getAvailableOrgMembersFn,
  addProjectMemberFn,
  updateProjectMemberRoleFn,
  removeProjectMemberFn,
} from "@/server-functions/project-functions";
import { toast } from "sonner";
import type { ProjectRole } from "@/interfaces";

interface ProjectTeamDialogProps {
  project: Project;
  currentUserId: number | null;
  onClose: () => void;
}

export function ProjectTeamDialog({
  project,
  currentUserId,
  onClose,
}: ProjectTeamDialogProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("team");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [memberToAdd, setMemberToAdd] = useState<any>(null);

  // Fetch current project team
  const { data: projectTeamResponse } = useSuspenseQuery({
    queryKey: ["project-team", project.id],
    queryFn: () => getProjectTeamFn({ data: { projectId: project.id } }),
  });

  // Fetch available organization members (not on project)
  const { data: availableMembersResponse } = useSuspenseQuery({
    queryKey: ["available-org-members", project.id],
    queryFn: () =>
      getAvailableOrgMembersFn({ data: { projectId: project.id } }),
  });

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: addProjectMemberFn,
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: updateProjectMemberRoleFn,
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeProjectMemberFn,
  });

  const currentTeam = projectTeamResponse?.data?.currentTeam || [];
  const availableMembers =
    availableMembersResponse?.data?.availableMembers || [];

  const handleAddMember = (member: any, role: ProjectRole) => {
    toast.promise(
      addMemberMutation.mutateAsync({
        data: {
          projectId: project.id,
          userId: member.id,
          role,
        },
      }),
      {
        loading: "Adding member to project...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["project-team", project.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["available-org-members", project.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["organization-projects"],
          });
          setShowAddMemberModal(false);
          setMemberToAdd(null);
          return `${member.name} added to project successfully!`;
        },
        error: "Failed to add member to project",
      },
    );
  };

  const handleRoleChange = (userId: number, newRole: ProjectRole) => {
    toast.promise(
      updateMemberRoleMutation.mutateAsync({
        data: {
          projectId: project.id,
          userId,
          newRole,
        },
      }),
      {
        loading: "Updating member role...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["project-team", project.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["organization-projects"],
          });
          return "Member role updated successfully!";
        },
        error: "Failed to update member role",
      },
    );
  };

  const handleRemoveMember = (member: any) => {
    setMemberToRemove(member);
  };

  const confirmRemoveMember = (userId: number) => {
    toast.promise(
      removeMemberMutation.mutateAsync({
        data: {
          projectId: project.id,
          userId,
        },
      }),
      {
        loading: "Removing member from project...",
        success: () => {
          queryClient.invalidateQueries({
            queryKey: ["project-team", project.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["available-org-members", project.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["organization-projects"],
          });
          setMemberToRemove(null);
          return "Member removed from project successfully!";
        },
        error: "Failed to remove member from project",
      },
    );
  };

  const handleAddMemberClick = (member: any) => {
    setMemberToAdd(member);
    setShowAddMemberModal(true);
  };

  return (
    <>
      <Drawer open onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] h-[95vh]">
          <DrawerHeader>
            <DrawerTitle>Team Management - {project.name}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto flex-1">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full h-full flex flex-col"
            >
              <ProjectTeamTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                currentTeamCount={currentTeam.length}
                availableMembersCount={availableMembers.length}
              />

              <CurrentTeamTable
                currentTeam={currentTeam}
                currentUserId={currentUserId}
                projectOwnerId={project.ownerId}
                onRoleChange={handleRoleChange}
                onRemoveMember={handleRemoveMember}
              />

              <AvailableMembersTable
                availableMembers={availableMembers}
                onAddMember={handleAddMemberClick}
              />
            </Tabs>
          </div>
        </DrawerContent>
      </Drawer>

      <AddMemberDialog
        open={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setMemberToAdd(null);
        }}
        member={memberToAdd}
        projectName={project.name}
        onAdd={handleAddMember}
        isLoading={addMemberMutation.isPending}
      />

      <RemoveTeamMemberDialog
        open={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        member={memberToRemove}
        projectName={project.name}
        onConfirm={confirmRemoveMember}
        isLoading={removeMemberMutation.isPending}
      />
    </>
  );
}

