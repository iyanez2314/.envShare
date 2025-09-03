import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware/auth-middleware";
import { prismaClient } from "@/services/prisma";
import { checkOrganizationRole } from "@/lib/role-utils";

export * from "./env-vars";
export * from "./team-management";

export const getOrganizationProjectsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { organizationId: string | number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const orgIdNum =
        typeof data.organizationId === "string"
          ? parseInt(data.organizationId)
          : data.organizationId;

      // Check if user has access to this organization
      const roleCheck = await checkOrganizationRole(user.id, orgIdNum);

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message: roleCheck.error || "Forbidden: No access to organization",
        };
      }

      // Fetch organization with all projects and their associated data
      const organizationWithProjects =
        await prismaClient.organization.findUnique({
          where: { id: orgIdNum },
          include: {
            projects: {
              include: {
                owner: true,
                organization: true,
                envVars: true,
                userRoles: {
                  include: {
                    user: true,
                  },
                },
                teamMembers: true,
              },
            },
            users: true,
            owner: true,
            userRoles: {
              include: {
                user: true,
              },
            },
          },
        });

      if (!organizationWithProjects) {
        return {
          success: false,
          message: "Organization not found",
        };
      }

      return {
        success: true,
        data: {
          organization: organizationWithProjects,
          projects: organizationWithProjects.projects,
          projectCount: organizationWithProjects.projects.length,
        },
      };
    } catch (error) {
      console.error("Error fetching organization projects:", error);
      throw new Error("Internal Server Error");
    }
  });

export const createOrganizationProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      organizationId: number;
      name: string;
      description: string | null;
      githubUrl: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      // Check if user has access to this organization
      const roleCheck = await checkOrganizationRole(
        user.id,
        data.organizationId,
      );

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: No access to create project in this organization",
        };
      }

      // Create the new project
      const newProject = await prismaClient.project.create({
        data: {
          name: data.name,
          description: data.description || null,
          githubUrl: data.githubUrl || null,
          organizationId: data.organizationId,
          ownerId: user.id,
          teamMembers: {
            connect: { id: user.id },
          },
        },
        include: {
          owner: true,
          organization: true,
          envVars: true,
          userRoles: {
            include: {
              user: true,
            },
          },
          teamMembers: true,
        },
      });

      return {
        success: true,
        data: newProject,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      throw new Error("Internal Server Error");
    }
  });

export const updateOrganizationProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      projectId: number;
      name: string;
      description: string | null;
      githubUrl: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      // First check if the project exists and user has access
      const existingProject = await prismaClient.project.findUnique({
        where: { id: data.projectId },
        include: { organization: true },
      });

      if (!existingProject) {
        return {
          success: false,
          message: "Project not found",
        };
      }

      // Check if user has access to this organization
      const roleCheck = await checkOrganizationRole(
        user.id,
        existingProject.organizationId,
        "OWNER",
      );

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: No access to update project in this organization",
        };
      }

      // Update the project
      const updatedProject = await prismaClient.project.update({
        where: { id: data.projectId },
        data: {
          name: data.name,
          description: data.description || null,
          githubUrl: data.githubUrl || null,
        },
        include: {
          owner: true,
          organization: true,
          envVars: true,
          userRoles: {
            include: {
              user: true,
            },
          },
          teamMembers: true,
        },
      });

      return {
        success: true,
        data: updatedProject,
      };
    } catch (error) {
      console.error("Error updating project:", error);
      throw new Error("Internal Server Error");
    }
  });

export const deleteOrganizationProjectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { projectId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      // First check if the project exists and user has access
      const existingProject = await prismaClient.project.findUnique({
        where: { id: data.projectId },
        include: { organization: true },
      });

      if (!existingProject) {
        return {
          success: false,
          message: "Project not found",
        };
      }

      // Check if user has access to this organization
      const roleCheck = await checkOrganizationRole(
        user.id,
        existingProject.organizationId,
        "OWNER",
      );

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: No access to delete project in this organization",
        };
      }

      // Delete the project (this will cascade delete related records)
      await prismaClient.project.delete({
        where: { id: data.projectId },
      });

      return {
        success: true,
        message: "Project deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting project:", error);
      throw new Error("Internal Server Error");
    }
  });
