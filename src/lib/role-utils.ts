import { prismaClient } from "@/services/prisma";
import type { OrganizationRole, ProjectRole, User } from "@/interfaces";

// Organization role checking utilities
export const checkOrganizationRole = async (
  userId: number,
  organizationId: number,
  requiredRole?: OrganizationRole
) => {
  try {
    const org = await prismaClient.organization.findUnique({
      where: { id: organizationId },
      include: { 
        userRoles: {
          where: { userId }
        }
      },
    });

    if (!org) {
      return { 
        hasAccess: false, 
        role: null, 
        error: "Organization not found" 
      };
    }

    const userRole = org.userRoles[0]?.role;

    if (!userRole) {
      return { 
        hasAccess: false, 
        role: null, 
        error: "User not found in organization" 
      };
    }

    // If no specific role is required, just check if user is in org
    if (!requiredRole) {
      return { 
        hasAccess: true, 
        role: userRole, 
        organization: org 
      };
    }

    // Check if user has the required role or higher
    const hasRequiredRole = checkOrganizationRoleHierarchy(userRole, requiredRole);

    return {
      hasAccess: hasRequiredRole,
      role: userRole,
      organization: org,
      error: hasRequiredRole ? null : `Forbidden: ${requiredRole} role required`
    };

  } catch (error) {
    console.error("Error checking organization role:", error);
    return { 
      hasAccess: false, 
      role: null, 
      error: "Internal server error" 
    };
  }
};

// Project role checking utilities
export const checkProjectRole = async (
  userId: number,
  projectId: number,
  requiredRole?: ProjectRole
) => {
  try {
    const project = await prismaClient.project.findUnique({
      where: { id: projectId },
      include: { 
        userRoles: {
          where: { userId }
        },
        organization: {
          include: {
            userRoles: {
              where: { userId }
            }
          }
        }
      },
    });

    if (!project) {
      return { 
        hasAccess: false, 
        role: null, 
        error: "Project not found" 
      };
    }

    // Check project-level role first
    const projectRole = project.userRoles[0]?.role;
    
    // If user has project role, use that
    if (projectRole) {
      if (!requiredRole) {
        return { 
          hasAccess: true, 
          role: projectRole, 
          project 
        };
      }

      const hasRequiredRole = checkProjectRoleHierarchy(projectRole, requiredRole);
      return {
        hasAccess: hasRequiredRole,
        role: projectRole,
        project,
        error: hasRequiredRole ? null : `Forbidden: ${requiredRole} role required`
      };
    }

    // Fallback to organization role
    const orgRole = project.organization.userRoles[0]?.role;
    
    if (!orgRole) {
      return { 
        hasAccess: false, 
        role: null, 
        error: "User not found in project or organization" 
      };
    }

    // Map org role to project role
    const mappedProjectRole: ProjectRole = 
      orgRole === "SUPER_OWNER" || orgRole === "OWNER" ? "OWNER" :
      orgRole === "ADMIN" ? "EDITOR" : 
      "VIEWER";

    if (!requiredRole) {
      return { 
        hasAccess: true, 
        role: mappedProjectRole, 
        project 
      };
    }

    const hasRequiredRole = checkProjectRoleHierarchy(mappedProjectRole, requiredRole);
    return {
      hasAccess: hasRequiredRole,
      role: mappedProjectRole,
      project,
      error: hasRequiredRole ? null : `Forbidden: ${requiredRole} role required`
    };

  } catch (error) {
    console.error("Error checking project role:", error);
    return { 
      hasAccess: false, 
      role: null, 
      error: "Internal server error" 
    };
  }
};

// Organization role hierarchy checker
export const checkOrganizationRoleHierarchy = (
  userRole: OrganizationRole,
  requiredRole: OrganizationRole
): boolean => {
  const hierarchy: Record<OrganizationRole, number> = {
    "SUPER_OWNER": 4,
    "OWNER": 3,
    "ADMIN": 2,
    "MEMBER": 1,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
};

// Project role hierarchy checker
export const checkProjectRoleHierarchy = (
  userRole: ProjectRole,
  requiredRole: ProjectRole
): boolean => {
  const hierarchy: Record<ProjectRole, number> = {
    "OWNER": 3,
    "EDITOR": 2,
    "VIEWER": 1,
  };

  return hierarchy[userRole] >= hierarchy[requiredRole];
};

// Convenience functions for organization role checks
export const requireOrganizationSuperOwner = async (userId: number, organizationId: number) => {
  return await checkOrganizationRole(userId, organizationId, "SUPER_OWNER");
};

export const requireOrganizationOwner = async (userId: number, organizationId: number) => {
  return await checkOrganizationRole(userId, organizationId, "OWNER");
};

export const requireOrganizationAdmin = async (userId: number, organizationId: number) => {
  return await checkOrganizationRole(userId, organizationId, "ADMIN");
};

export const requireOrganizationMember = async (userId: number, organizationId: number) => {
  return await checkOrganizationRole(userId, organizationId, "MEMBER");
};

// Convenience functions for project role checks
export const requireProjectOwner = async (userId: number, projectId: number) => {
  return await checkProjectRole(userId, projectId, "OWNER");
};

export const requireProjectEditor = async (userId: number, projectId: number) => {
  return await checkProjectRole(userId, projectId, "EDITOR");
};

// Helper to check if user can manage another user's role
export const canManageUserRole = async (
  managerId: number, 
  targetUserId: number, 
  organizationId: number
): Promise<{ canManage: boolean; error?: string }> => {
  try {
    const [managerRole, targetRole] = await Promise.all([
      checkOrganizationRole(managerId, organizationId),
      checkOrganizationRole(targetUserId, organizationId)
    ]);

    if (!managerRole.hasAccess || !targetRole.hasAccess) {
      return { canManage: false, error: "User not found in organization" };
    }

    // Super owners can manage anyone except other super owners
    if (managerRole.role === "SUPER_OWNER") {
      return { 
        canManage: targetRole.role !== "SUPER_OWNER",
        error: targetRole.role === "SUPER_OWNER" ? "Cannot manage other super owners" : undefined
      };
    }

    // Owners can manage admins and members
    if (managerRole.role === "OWNER") {
      return { 
        canManage: targetRole.role === "ADMIN" || targetRole.role === "MEMBER",
        error: targetRole.role === "OWNER" || targetRole.role === "SUPER_OWNER" ? 
          "Cannot manage users with equal or higher privileges" : undefined
      };
    }

    // Admins can only manage members
    if (managerRole.role === "ADMIN") {
      return { 
        canManage: targetRole.role === "MEMBER",
        error: targetRole.role !== "MEMBER" ? 
          "Can only manage members" : undefined
      };
    }

    // Members cannot manage anyone
    return { canManage: false, error: "Insufficient privileges" };

  } catch (error) {
    console.error("Error checking user management permissions:", error);
    return { canManage: false, error: "Internal server error" };
  }
};