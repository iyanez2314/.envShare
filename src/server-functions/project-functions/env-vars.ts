import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware/auth-middleware";
import { prismaClient } from "@/services/prisma";
import { checkOrganizationRole } from "@/lib/role-utils";
import type { EnvironmentVariable } from "@/interfaces";

export const updateProjectEnvVarsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      projectId: number;
      envVars: EnvironmentVariable[];
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

      // Check if user has access to this organization (OWNER or MEMBER role)
      const roleCheck = await checkOrganizationRole(
        user.id,
        existingProject.organizationId,
      );

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: No access to update environment variables for this project",
        };
      }

      // Delete existing environment variables for this project
      await prismaClient.environmentVariable.deleteMany({
        where: { projectId: data.projectId },
      });

      // Create new environment variables
      if (data.envVars.length > 0) {
        await prismaClient.environmentVariable.createMany({
          data: data.envVars.map((envVar) => ({
            key: envVar.key,
            value: envVar.value,
            projectId: data.projectId,
          })),
        });
      }

      // Fetch the updated project with environment variables
      const updatedProject = await prismaClient.project.findUnique({
        where: { id: data.projectId },
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
        message: "Environment variables updated successfully",
      };
    } catch (error) {
      console.error("Error updating project environment variables:", error);
      throw new Error("Internal Server Error");
    }
  });

export const getProjectEnvVarsFn = createServerFn({ method: "GET" })
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
      );

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: No access to view environment variables for this project",
        };
      }

      // Fetch environment variables
      const envVars = await prismaClient.environmentVariable.findMany({
        where: { projectId: data.projectId },
        orderBy: { createdAt: "asc" },
      });

      return {
        success: true,
        data: envVars,
      };
    } catch (error) {
      console.error("Error fetching project environment variables:", error);
      throw new Error("Internal Server Error");
    }
  });