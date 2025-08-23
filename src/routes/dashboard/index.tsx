import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Folder, GitBranch, Sun, Moon } from "lucide-react";
import { ProjectForm } from "@/components/project-form";
import { ProjectCard } from "@/components/project-card";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/interfaces";
import { TeamMember } from "@/interfaces";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { setTheme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentUserId] = useState("current-user-id"); // In real app, this would come from auth

  useEffect(() => {
    const savedProjects = localStorage.getItem("github-projects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("github-projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = (
    projectData: Omit<Project, "id" | "createdAt" | "teamMembers" | "ownerId">,
  ) => {
    const newProject: Project = {
      ...projectData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      teamMembers: [
        {
          id: crypto.randomUUID(),
          email: "you@example.com", // In real app, this would come from auth
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-6 w-6 text-accent" />
                <h1 className="text-xl font-semibold text-card-foreground">
                  .envShare
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => setShowProjectForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Folder className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get started by creating your first GitHub project folder. You can
              add environment variables and manage your repository
              configurations.
            </p>
            <Button
              onClick={() => setShowProjectForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Your Projects</h2>
                <p className="text-muted-foreground">
                  Manage your GitHub repositories and environment variables
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground"
              >
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </main>

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
