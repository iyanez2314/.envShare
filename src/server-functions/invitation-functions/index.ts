import { createServerFn } from "@tanstack/react-start";
import { validateIncomingRequestFn } from "../index";
import { prismaClient } from "@/services/prisma";
import { requireOrganizationOwner } from "@/lib/role-utils";
import { OrganizationRole } from "@prisma/client";

export const getOrganizationInvitationsFn = createServerFn({ method: "POST" })
  .validator((data: { orgId: string | number }) => data)
  .handler(async ({ data }) => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const { hasAccess } = await requireOrganizationOwner(userId, orgId);

      if (!hasAccess) {
        throw new Error("Forbidden: OWNER role required");
      }

      const invitations = await prismaClient.organizationInvitation.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          email: true,
          status: true,
          role: true,
          createdAt: true,
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: invitations,
      };
    } catch (error) {
      console.error("Error fetching organization invitations:", error);
      throw new Error("Internal Server Error");
    }
  });

export const updateInvitedUserRoleChangeFn = createServerFn({
  method: "POST",
})
  .validator(
    (data: {
      invitationId: string;
      updatedRole: OrganizationRole;
      orgId: string | number;
    }) => data,
  )
  .handler(async ({ data }) => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const invitationId = data.invitationId;
      const updatedRole = data.updatedRole;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const { hasAccess } = await requireOrganizationOwner(userId, orgId);

      if (!hasAccess) {
        throw new Error("Forbidden: OWNER role required");
      }

      const updatedInvitation =
        await prismaClient.organizationInvitation.update({
          where: {
            id: invitationId,
          },
          data: {
            role: updatedRole,
          },
        });

      return { success: true, data: updatedInvitation };
    } catch (error) {
      console.error("Error updating invited user role:", error);
      throw new Error("Internal Server Error");
    }
  });
