import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/project-form";
import { ProjectCard } from "@/components/project-card";
import type {
  Project,
  Organization,
  OrganizationProjectsResponse,
} from "@/interfaces";
import { getOrganizationProjectsFn } from "@/server-functions";
import {
  createOrganizationProjectFn,
  updateOrganizationProjectFn,
  deleteOrganizationProjectFn,
} from "@/server-functions/project-functions";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/organization/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { user } = Route.useRouteContext();
  const currentUserId = user?.id;
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: projectsResponse } = useSuspenseQuery({
    queryKey: ["organization-projects", id],
    queryFn: () =>
      getOrganizationProjectsFn({ data: { organizationId: id as string } }),
  });

  const projectObj: OrganizationProjectsResponse = projectsResponse?.data || {
    organization: {} as Organization,
    projects: [],
    projectCount: 0,
  };

  const createProjectMutation = useMutation({
    mutationFn: createOrganizationProjectFn,
  });

  const updateProjectMutation = useMutation({
    mutationFn: updateOrganizationProjectFn,
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteOrganizationProjectFn,
  });

  const { status: createStatus } = createProjectMutation;
  const { status: updateStatus } = updateProjectMutation;
  const { status: deleteStatus } = deleteProjectMutation;

  const addProject = (
    projectData: Omit<
      Project,
      "id" | "createdAt" | "teamMembers" | "ownerId" | "organizationId"
    >,
  ) => {
    setShowProjectForm(false);
    toast.promise(
      createProjectMutation.mutateAsync({
        data: {
          ...projectData,
          organizationId: parseInt(id),
        },
      }),
      {
        loading: "Creating project...",
        success: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["organization-projects", id],
          });
          return `Project created successfully!`;
        },
        error: (err) => `Error creating project: ${err.message}`,
      },
    );
  };

  const updateProject = (updatedProject: Project) => {
    setShowProjectForm(false);
    toast.promise(
      updateProjectMutation.mutateAsync({
        data: {
          projectId: updatedProject.id,
          name: updatedProject.name,
          description: updatedProject.description,
          githubUrl: updatedProject.githubUrl,
        },
      }),
      {
        loading: "Updating project...",
        success: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["organization-projects", id],
          });
          return `Project updated successfully!`;
        },
        error: (err) => `Error updating project: ${err.message}`,
      },
    );
  };

  const deleteProject = (projectId: number) => {
    toast.promise(
      deleteProjectMutation.mutateAsync({
        data: { projectId },
      }),
      {
        loading: "Deleting project...",
        success: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["organization-projects", id],
          });
          return `Project deleted successfully!`;
        },
        error: (err) => `Error deleting project: ${err.message}`,
      },
    );
  };

  return (
    <div>
      {/* Organization Header with Back Button */}
      <div className="border-b border-border  -mx-6 px-6 -mt-8 pt-8 pb-4 mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: "/dashboard" })}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-semibold text-card-foreground">
              {projectObj?.organization
                ? projectObj.organization.name
                : "Organization"}
            </h1>
          </div>
        </div>
      </div>

      {/* Projects Content */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Projects</h2>
            <p className="text-muted-foreground">
              Manage projects in {projectObj?.organization?.name}
            </p>
          </div>
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {projectObj.projectCount}{" "}
            {projectObj.projectCount === 1 ? "project" : "projects"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create Project Card */}
          <div
            onClick={() => setShowProjectForm(true)}
            className="h-full bg-card border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/5 transition-colors cursor-pointer rounded-lg"
          >
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="rounded-full bg-muted/50 p-4 mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Create Project
              </h3>
              <p className="text-sm text-muted-foreground">
                Add a new project to {projectObj?.organization?.name}
              </p>
            </div>
          </div>

          {/* Existing Projects */}
          {projectObj?.projects?.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUserId ?? undefined}
              onEdit={setSelectedProject}
              onDelete={deleteProject}
              onUpdate={updateProject}
            />
          ))}
        </div>
      </div>

      {/* Project Form Modal */}
      {showProjectForm && (
        <ProjectForm
          onSubmit={addProject}
          onClose={() => setShowProjectForm(false)}
        />
      )}

      {/* Edit Project Modal */}
      {selectedProject && (
        <ProjectForm
          project={selectedProject}
          onSubmit={(data) => {
            updateProject({ ...selectedProject, ...data });
            setSelectedProject(null);
          }}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
