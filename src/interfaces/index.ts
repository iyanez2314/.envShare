export interface TeamMember {
  id: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  addedAt: string;
}

export interface Project {
  id: string;
  name: string;
  githubUrl: string;
  description?: string;
  envVars: { [key: string]: string };
  createdAt: string;
  teamMembers: TeamMember[];
  ownerId: string;
}
