import { createServerFn } from "@tanstack/react-start";
import { validateIncomingRequestFn } from "../index";
import { prismaClient } from "@/services/prisma";
import { checkOrganizationRole } from "@/lib/role-utils";

export const getOrganizationProjectsFn = createServerFn({ method: "GET" })
  .validator((data: { organizationId: string | number }) => data)
  .handler(async ({ data }) => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

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
  .validator(
    (data: {
      organizationId: number;
      name: string;
      description?: string;
      githubUrl?: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

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
          description: data.description,
          githubUrl: data.githubUrl,
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
