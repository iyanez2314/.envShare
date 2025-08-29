// Enums matching Prisma
export type ProjectRole = "OWNER" | "EDITOR" | "VIEWER";
export type OrganizationRole = "OWNER" | "MEMBER";

// Core Models
export interface User {
  id: number;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
  // Relations (optional, loaded when needed)
  owner?: User;
  users?: User[];
  projects?: Project[];
  userRoles?: UserOrganizationRole[];
  // Legacy property for compatibility
  teamMembers?: TeamMember[];
  // Prisma count fields
  _count?: {
    projects?: number;
    users?: number;
  };
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  githubUrl: string | null;
  organizationId: number;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
  // Relations (optional, loaded when needed)
  project?: Project;
}

export interface UserOrganizationRole {
  id: number;
  userId: number;
  organizationId: number;
  role: OrganizationRole;
  createdAt: Date;
  updatedAt: Date;
  // Relations (optional, loaded when needed)
  user?: User;
  organization?: Organization;
}

export interface UserProjectRole {
  id: number;
  userId: number;
  projectId: number;
  role: ProjectRole;
  createdAt: Date;
  updatedAt: Date;
  // Relations (optional, loaded when needed)
  user?: User;
  project?: Project;
}

// API Response Interfaces
export interface OrganizationProjectsResponse {
  organization: Organization;
  projects: Project[];
  projectCount: number;
}

// Legacy interfaces for backward compatibility (can be removed after migration)
export interface TeamMember {
  id: number | string; // Support both for compatibility
  email: string;
  role: "owner" | "editor" | "viewer" | OrganizationRole;
  addedAt: string;
}
