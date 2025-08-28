import { createServerFn } from "@tanstack/react-start";
import { validateIncomingRequestFn } from "../index";
import { prismaClient } from "@/services/prisma";
import { requireOrganizationOwner } from "@/lib/role-utils";
import { User } from "@/interfaces";

export const createOrganizationFn = createServerFn({ method: "POST" })
  .validator(
    (data: { name: string; description?: string; teamMembers?: User[] }) =>
      data,
  )
  .handler(async ({ data }) => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

      const newOrg = await prismaClient.organization.create({
        data: {
          name: data.name,
          userRoles: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
          description: data.description,
          ownerId: user.id,
          users: {
            connect: { id: user.id },
          },
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

export const deleteOrganizationFn = createServerFn({ method: "POST" })
  .validator((data: { orgId: string | number }) => data)
  .handler(async ({ data }) => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

      const orgIdNum =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const roleCheck = await requireOrganizationOwner(user.id, orgIdNum);

      if (!roleCheck.hasAccess) {
        return {
          success: false,
          message:
            roleCheck.error ||
            "Forbidden: Only owners can delete the organization",
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
