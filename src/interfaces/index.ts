// Enums matching Prisma
export type ProjectRole = "OWNER" | "EDITOR" | "VIEWER";
export type OrganizationRole = "OWNER" | "MEMBER";

// Core Models
export interface User {
  id: number;
  email: string;
  name?: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  description?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, loaded when needed)
  owner?: User;
  users?: User[];
  projects?: Project[];
  userRoles?: UserOrganizationRole[];
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  githubUrl?: string;
  organizationId: number;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, loaded when needed)
  organization?: Organization;
  owner?: User;
  teamMembers?: User[];
  envVars?: EnvironmentVariable[];
  userRoles?: UserProjectRole[];
}

export interface EnvironmentVariable {
  id: number;
  key: string;
  value: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, loaded when needed)
  project?: Project;
}

export interface UserOrganizationRole {
  id: number;
  userId: number;
  organizationId: number;
  role: OrganizationRole;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, loaded when needed)
  user?: User;
  organization?: Organization;
}

export interface UserProjectRole {
  id: number;
  userId: number;
  projectId: number;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, loaded when needed)
  user?: User;
  project?: Project;
}

// Legacy interfaces for backward compatibility (can be removed after migration)
export interface TeamMember {
  id: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  addedAt: string;
}
