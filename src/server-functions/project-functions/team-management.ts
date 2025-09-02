import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware/auth-middleware";
import { prismaClient } from "@/services/prisma";
import { checkOrganizationRole } from "@/lib/role-utils";
import type { ProjectRole } from "@/interfaces";

async function validateProjectAccess(userId: number, projectId: number) {
  const project = await prismaClient.project.findUnique({
    where: { id: projectId },
    select: { organizationId: true, ownerId: true },
  });

  if (!project) {
    return {
      success: false,
      message: "Project not found",
      project: null,
    };
  }

  // Check if user is project owner OR organization owner
  const isProjectOwner = project.ownerId === userId;
  const userHasOrgAccess = await checkOrganizationRole(
    userId,
    project.organizationId,
    "OWNER",
  );

  if (!isProjectOwner && !userHasOrgAccess.hasAccess) {
    return {
      success: false,
      message:
        "Forbidden - Only project owner or organization owner can manage members",
      project: null,
    };
  }

  return {
    success: true,
    message: "",
    project,
  };
}

// Get current project team members with their roles
export const getProjectTeamFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { projectId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user, valid } = context as AuthContext;

      if (!valid) {
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      const { projectId } = data;

      // Get team members with roles from UserProjectRole table
      const teamMembersWithRoles = await prismaClient.userProjectRole.findMany({
        where: { projectId },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Get project owner
      const project = await prismaClient.project.findUnique({
        where: { id: projectId },
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      });

      if (!project) {
        return {
          success: false,
          message: "Project not found",
        };
      }

      // Transform team members to flatten structure
      const teamMembers = teamMembersWithRoles.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        role: member.role,
        createdAt: member.createdAt,
      }));

      // Check if owner is already in team members, if not add them
      const ownerInTeam = teamMembers.find(
        (member) => member.id === project.owner.id,
      );
      if (!ownerInTeam) {
        teamMembers.unshift({
          id: project.owner.id,
          name: project.owner.name,
          email: project.owner.email,
          role: "OWNER" as ProjectRole,
          createdAt: project.createdAt,
        });
      }

      return {
        success: true,
        data: {
          currentTeam: teamMembers,
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
      const { user, valid } = context as AuthContext;
      const { projectId } = data;

      if (!valid) {
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // 1. Get project's organization ID
      const projectsOrgId = await prismaClient.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true, teamMembers: true },
      });

      // 2. Verify user has access to this organization
      const userHasAccess = await checkOrganizationRole(
        user.id,
        projectsOrgId?.organizationId || 0,
        "OWNER",
      );

      if (!userHasAccess.hasAccess) {
        return {
          success: false,
          message: "Forbidden",
        };
      }

      // 3. Get all organization members
      const allOrgMembers = await prismaClient.userOrganizationRole.findMany({
        where: { organizationId: projectsOrgId?.organizationId || 0 },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // 4. Filter out members already on the project
      const filteredMembersAlreadyOnProject = allOrgMembers.filter(
        (member) =>
          !projectsOrgId?.teamMembers.some((tm) => tm.id === member.user.id),
      );

      // 5. Return available members
      const availableMembers = filteredMembersAlreadyOnProject.map(
        (member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          organizationRole: member.role,
          joinedAt: member.createdAt,
        }),
      );

      return {
        success: true,
        data: {
          availableMembers: availableMembers, // Array of org members not on project
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
    (data: { projectId: number; userId: number; role: ProjectRole }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user, valid } = context as AuthContext;
      const { projectId, userId, role } = data;

      if (!valid) {
        return {
          success: false,
          message: "Unauthorized",
        };
      }

      // 1. Verify user has access to manage project
      const accessCheck = await validateProjectAccess(user.id, projectId);
      if (!accessCheck.success) {
        return {
          success: false,
          message: accessCheck.message,
        };
      }
      const project = accessCheck.project!;
      // 2. Verify target user is in the same organization
      const targetUserOrgRole =
        await prismaClient.userOrganizationRole.findFirst({
          where: {
            userId: userId,
            organizationId: project.organizationId,
          },
        });

      if (!targetUserOrgRole) {
        return {
          success: false,
          message: "User is not a member of the organization",
        };
      }
      // 3. Verify target user is not already on project
      const targetUserProjectRole =
        await prismaClient.userProjectRole.findFirst({
          where: { userId: userId, projectId: projectId },
        });

      if (targetUserProjectRole) {
        return {
          success: false,
          message: "User is already a member of the project",
        };
      }
      // 4. Create UserProjectRole entry
      const newUserProjectRole = await prismaClient.userProjectRole.create({
        data: {
          userId: userId,
          projectId: projectId,
          role: role,
        },
      });

      if (!newUserProjectRole) {
        return {
          success: false,
          message: "Failed to add user to project",
        };
      }

      // 5. Add user to project.teamMembers
      const updatedProject = await prismaClient.project.update({
        where: { id: projectId },
        data: {
          teamMembers: {
            connect: { id: userId },
          },
        },
      });

      if (!updatedProject) {
        return {
          success: false,
          message: "Failed to update project team members",
        };
      }

      // 6. Return success
      return {
        success: true,
        data: {
          userId: userId,
          role: role,
          addedAt: newUserProjectRole.createdAt,
        },
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
    (data: { projectId: number; userId: number; newRole: ProjectRole }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      const { projectId, userId, newRole } = data;

      // 1. Verify user has access to manage project
      const accessCheck = await validateProjectAccess(user.id, projectId);
      if (!accessCheck.success) {
        return {
          success: false,
          message: accessCheck.message,
        };
      }
      const project = accessCheck.project!;

      // 2. Verify target user is on the project
      const targetUserProjectRole =
        await prismaClient.userProjectRole.findFirst({
          where: {
            userId: userId,
            projectId: projectId,
          },
        });

      if (!targetUserProjectRole) {
        return {
          success: false,
          message: "User is not a member of the project",
        };
      }

      // 3. Prevent changing project owner's role
      if (project.ownerId === userId) {
        return {
          success: false,
          message: "Cannot change project owner's role",
        };
      }

      // 4. Update UserProjectRole entry
      const updatedRole = await prismaClient.userProjectRole.update({
        where: {
          id: targetUserProjectRole.id,
        },
        data: {
          role: newRole,
        },
      });

      // 5. Return updated team data
      return {
        success: true,
        data: {
          userId: userId,
          newRole: newRole,
          updatedAt: updatedRole.updatedAt,
        },
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
  .validator((data: { projectId: number; userId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const { projectId, userId } = data;

      // 1. Verify user has access to manage project
      const accessCheck = await validateProjectAccess(user.id, projectId);
      if (!accessCheck.success) {
        return {
          success: false,
          message: accessCheck.message,
        };
      }
      const project = accessCheck.project!;

      // 2. Verify target user is on the project
      const targetUserProjectRole =
        await prismaClient.userProjectRole.findFirst({
          where: {
            userId: userId,
            projectId: projectId,
          },
        });

      if (!targetUserProjectRole) {
        return {
          success: false,
          message: "User is not a member of the project",
        };
      }

      // 3. Prevent removing project owner
      if (project.ownerId === userId) {
        return {
          success: false,
          message: "Cannot remove project owner",
        };
      }
      // 4. Delete UserProjectRole entry
      const removeUserProjectRole = await prismaClient.userProjectRole.delete({
        where: {
          id: targetUserProjectRole.id,
        },
      });

      // 5. Remove user from project.teamMembers
      const updatedProject = await prismaClient.project.update({
        where: { id: projectId },
        data: {
          teamMembers: {
            disconnect: { id: userId },
          },
        },
      });

      // 6. Return updated team data
      return {
        success: true,
        data: {
          userId: userId,
          removedAt: new Date(),
        },
        message: "Member removed from project successfully",
      };
    } catch (error) {
      console.error("Error removing project member:", error);
      throw new Error("Internal Server Error");
    }
  });
