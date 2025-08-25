import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, ArrowLeft } from "lucide-react";
import { ProjectForm } from "@/components/project-form";
import { ProjectCard } from "@/components/project-card";
import type { Project, Organization } from "@/interfaces";

export const Route = createFileRoute("/dashboard/organization/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentUserId] = useState("current-user-id");

  useEffect(() => {
    // Load organization data
    const savedOrganizations = localStorage.getItem("github-organizations");
    if (savedOrganizations) {
      const orgs: Organization[] = JSON.parse(savedOrganizations);
      const org = orgs.find((o) => o.id === id);
      setOrganization(org || null);
    }

    // Load projects data
    const savedProjects = localStorage.getItem("github-projects");
    if (savedProjects) {
      const allProjects: Project[] = JSON.parse(savedProjects);
      const orgProjects = allProjects.filter((p) => p.organizationId === id);
      setProjects(orgProjects);
    }
  }, [id]);

  useEffect(() => {
    // Save projects when they change
    const savedProjects = localStorage.getItem("github-projects");
    const allProjects: Project[] = savedProjects
      ? JSON.parse(savedProjects)
      : [];

    // Remove old projects for this org and add current ones
    const otherProjects = allProjects.filter((p) => p.organizationId !== id);
    const updatedProjects = [...otherProjects, ...projects];

    localStorage.setItem("github-projects", JSON.stringify(updatedProjects));
  }, [projects, id]);

  const addProject = (
    projectData: Omit<
      Project,
      "id" | "createdAt" | "teamMembers" | "ownerId" | "organizationId"
    >,
  ) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      organizationId: id,
      teamMembers: [
        {
          id: crypto.randomUUID(),
          email: "you@example.com",
          role: "owner",
          addedAt: new Date().toISOString(),
        },
      ],
      ownerId: currentUserId,
    };
    setProjects((prev) => [...prev, newProject]);
    setShowProjectForm(false);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Organization not found
          </h2>
          <Button onClick={() => navigate({ to: "/dashboard" })}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

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
