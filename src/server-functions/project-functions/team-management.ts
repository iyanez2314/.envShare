import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware/auth-middleware";
import { prismaClient } from "@/services/prisma";
import { checkOrganizationRole } from "@/lib/role-utils";
import type { ProjectRole } from "@/interfaces";

// Get current project team members with their roles
export const getProjectTeamFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      
      // TODO: Implement logic to:
      // 1. Verify user has access to this project
      // 2. Fetch project with team members and roles
      // 3. Return formatted team data
      
      return {
        success: true,
        data: {
          currentTeam: [], // Array of team members with roles
          projectInfo: {}, // Basic project info
        },
      };
    } catch (error) {
      console.error("Error fetching project team:", error);
      throw new Error("Internal Server Error");
    }
  });

// Get organization members who are NOT currently on the project
export const getAvailableOrgMembersFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      
      // TODO: Implement logic to:
      // 1. Get project's organization ID
      // 2. Verify user has access to this organization
      // 3. Get all organization members
      // 4. Filter out members already on the project
      // 5. Return available members
      
      return {
        success: true,
        data: {
          availableMembers: [], // Array of org members not on project
          organizationInfo: {}, // Basic org info
        },
      };
    } catch (error) {
      console.error("Error fetching available org members:", error);
      throw new Error("Internal Server Error");
    }
  });

// Add an organization member to the project with a specific role
export const addProjectMemberFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      projectId: number;
      userId: number;
      role: ProjectRole;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      
      // TODO: Implement logic to:
      // 1. Verify user has OWNER role on project
      // 2. Verify target user is in the same organization
      // 3. Verify target user is not already on project
      // 4. Create UserProjectRole entry
      // 5. Add user to project.teamMembers
      // 6. Return updated project team
      
      return {
        success: true,
        data: {}, // Updated project team data
        message: "Member added to project successfully",
      };
    } catch (error) {
      console.error("Error adding project member:", error);
      throw new Error("Internal Server Error");
    }
  });

// Update a project member's role
export const updateProjectMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      projectId: number;
      userId: number;
      newRole: ProjectRole;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      
      // TODO: Implement logic to:
      // 1. Verify user has OWNER role on project
      // 2. Verify target user is on the project
      // 3. Prevent changing project owner's role
      // 4. Update UserProjectRole entry
      // 5. Return updated team data
      
      return {
        success: true,
        data: {}, // Updated project team data
        message: "Member role updated successfully",
      };
    } catch (error) {
      console.error("Error updating project member role:", error);
      throw new Error("Internal Server Error");
    }
  });

// Remove a member from the project
export const removeProjectMemberFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      projectId: number;
      userId: number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      
      // TODO: Implement logic to:
      // 1. Verify user has OWNER role on project
      // 2. Verify target user is on the project
      // 3. Prevent removing project owner
      // 4. Delete UserProjectRole entry
      // 5. Remove user from project.teamMembers
      // 6. Return updated team data
      
      return {
        success: true,
        data: {}, // Updated project team data
        message: "Member removed from project successfully",
      };
    } catch (error) {
      console.error("Error removing project member:", error);
      throw new Error("Internal Server Error");
    }
  });