import { createServerFn } from "@tanstack/react-start";
import { validateIncomingRequestFn } from "../index";
import { prismaClient } from "@/services/prisma";

export const getUserOrganizationsFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

      const userWithOrganizations = await prismaClient.user.findUnique({
        where: { id: user.id },
        select: {
          organizations: {
            include: {
              users: true,
              userRoles: {
                include: {
                  user: true,
                },
              },
              owner: true,
              projects: true,
              _count: {
                select: {
                  projects: true,
                },
              },
            },
          },
        },
      });

      if (!userWithOrganizations) {
        return {
          success: false,
          message: "User not found",
        };
      }

      const transformedOrganizations = userWithOrganizations.organizations.map(
        (org) => ({
          ...org,
          description: org.description ?? undefined, // Convert null to undefined
          owner: org.owner
            ? {
                ...org.owner,
                name: org.owner.name ?? undefined, // Convert null to undefined
              }
            : undefined,
          users:
            org.users?.map((user) => ({
              ...user,
              name: user.name ?? undefined, // Convert null to undefined
            })) || [],
          userRoles:
            org.userRoles?.map((role) => ({
              ...role,
              user: role.user
                ? {
                    ...role.user,
                    name: role.user.name ?? undefined, // Convert null to undefined
                  }
                : undefined,
            })) || [],
          teamMembers:
            org.userRoles?.map((role) => ({
              id: role.user?.id || role.userId,
              email: role.user?.email || "",
              role: role.role,
              addedAt: role.createdAt.toISOString(),
            })) || [],
          projects:
            org.projects?.map((project) => ({
              ...project,
              description: project.description ?? undefined, // Convert null to undefined
              githubUrl: project.githubUrl ?? undefined, // Convert null to undefined
            })) || [],
        }),
      );

      return {
        success: true,
        data: transformedOrganizations,
      };
    } catch (error) {
      console.error("Error fetching user organizations:", error);
      throw new Error("Internal Server Error");
    }
  },
);
