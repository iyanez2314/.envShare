import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware/auth-middleware";
import { prismaClient } from "@/services/prisma";
import {
  requireOrganizationOwner,
  requireOrganizationSuperOwner,
} from "@/lib/role-utils";
import { User } from "@/interfaces";
import { OrganizationRole } from "@prisma/client";

export * from "./user-organizations";
export * from "./hierarchical-roles";

export const createOrganizationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string; description?: string }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const newOrg = await prismaClient.organization.create({
        data: {
          name: data.name,
          userRoles: {
            create: {
              userId: user.id,
              role: "SUPER_OWNER", // New organizations start with creator as super owner
            },
          },
          description: data.description,
          ownerId: user.id, // Legacy field for compatibility
          superOwnerId: user.id, // New hierarchical field
          users: {
            connect: { id: user.id },
          },
        },
        include: {
          userRoles: {
            include: {
              user: true,
            },
          },
          users: true,
          owner: true,
        },
      });

      return {
        success: true,
        data: newOrg,
      };
    } catch (error) {
      console.error("Error creating organization:", error);
      throw new Error("Internal Server Error");
    }
  });

export const updateOrganizationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: { orgId: string | number; name?: string; description?: string }) =>
      data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const orgIdNum =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const roleCheck = await requireOrganizationOwner(user.id, orgIdNum);

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: Only owners can update the organization",
        };
      }

      const updatedOrg = await prismaClient.organization.update({
        where: { id: orgIdNum },
        data: {
          name: data.name,
          description: data.description,
        },
      });

      return {
        success: true,
        message: "Organization updated successfully",
        data: updatedOrg,
      };
    } catch (error) {
      console.error("Error updating organization:", error);
      throw new Error("Internal Server Error");
    }
  });

export const deleteOrganizationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId: string | number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const orgIdNum =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const roleCheck = await requireOrganizationSuperOwner(user.id, orgIdNum);

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: Only Super owners can delete the organization",
        };
      }

      await prismaClient.organization.delete({
        where: { id: orgIdNum },
      });

      return {
        success: true,
        message: "Organization deleted successfully",
        removedOrgId: orgIdNum,
      };
    } catch (error) {
      console.error("Error deleting organization:", error);
      throw new Error("Internal Server Error");
    }
  });

export const updateOrganizationMemberRoleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      memberId: number;
      newRole: OrganizationRole;
      orgId: string | number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const { hasAccess } = await requireOrganizationOwner(userId, orgId);

      if (!hasAccess) {
        throw new Error("Forbidden: OWNER role required");
      }

      // Check if the member being updated is not the organization owner
      const organization = await prismaClient.organization.findUnique({
        where: { id: orgId },
        select: { ownerId: true },
      });

      if (organization?.ownerId === data.memberId) {
        throw new Error("Cannot change the role of the organization owner");
      }

      // Update the user's organization role
      const updatedRole = await prismaClient.userOrganizationRole.update({
        where: {
          userId_organizationId: {
            userId: data.memberId,
            organizationId: orgId,
          },
        },
        data: {
          role: data.newRole,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { success: true, data: updatedRole };
    } catch (error) {
      console.error("Error updating organization member role:", error);
      throw new Error("Internal Server Error");
    }
  });

export const removeOrganizationMemberFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { memberId: number; orgId: string | number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const { hasAccess } = await requireOrganizationOwner(userId, orgId);

      if (!hasAccess) {
        throw new Error("Forbidden: OWNER role required");
      }

      // Check if the member being removed is not the organization owner
      const organization = await prismaClient.organization.findUnique({
        where: { id: orgId },
        select: { ownerId: true },
      });

      if (organization?.ownerId === data.memberId) {
        throw new Error("Cannot remove the organization owner");
      }

      // Remove the user's organization role
      await prismaClient.userOrganizationRole.delete({
        where: {
          userId_organizationId: {
            userId: data.memberId,
            organizationId: orgId,
          },
        },
      });

      // Remove the user from the organization
      await prismaClient.organization.update({
        where: { id: orgId },
        data: {
          users: {
            disconnect: { id: data.memberId },
          },
        },
      });

      return { success: true, message: "Member removed successfully" };
    } catch (error) {
      console.error("Error removing organization member:", error);
      throw new Error("Internal Server Error");
    }
  });
