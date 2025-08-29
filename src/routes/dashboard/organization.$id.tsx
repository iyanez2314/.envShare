import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/project-form";
import { ProjectCard } from "@/components/project-card";
import type { Project, Organization } from "@/interfaces";
import { getOrganizationProjectsFn } from "@/server-functions";
import { createOrganizationProjectFn } from "@/server-functions/project-functions";
import { useMutation } from "@/hooks/useMutation";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/organization/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    if (!params.id) {
      throw new Error("Organization ID is required");
    }
    const orgData = await getOrganizationProjectsFn({
      data: { organizationId: params.id },
    });

    if (!orgData.success) {
      throw new Error(orgData.message || "Failed to load organization data");
    }
    return orgData.data;
  },
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const loaderData = Route.useLoaderData();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization>(
    loaderData?.organization || [],
  );
  const [projects, setProjects] = useState<Project[]>(
    loaderData.projects || [],
  );
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const currentUserId = user?.id;

  const createProjectMutatoin = useMutation({
    fn: createOrganizationProjectFn,
    onSuccess: (ctx: any) => {
      if (ctx.data?.success) {
        setShowProjectForm(!showProjectForm);
        setProjects((prev) => [...prev, ctx.data.data as Project]);
      }
    },
  });

  const addProject = (
    projectData: Omit<
      Project,
      "id" | "createdAt" | "teamMembers" | "ownerId" | "organizationId"
    >,
  ) => {
    if (!organization.id) {
      toast.error("Organization ID is missing");
      return;
    }

    toast.promise(
      createProjectMutatoin.mutate({
        data: { ...projectData, organizationId: organization.id },
      }),
      {
        loading: "Creating project...",
        success: "Project created successfully!",
        error: "Failed to create project",
      },
    );
  };

  const updateProject = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
  };

  const deleteProject = (projectId: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
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
              {organization.name}
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
              Manage projects in {organization.name}
            </p>
          </div>
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
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
                Add a new project to {organization.name}
              </p>
            </div>
          </div>

          {/* Existing Projects */}
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUserId}
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
