import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware/auth-middleware";
import { prismaClient } from "@/services/prisma";
import { resend } from "@/services/resend";
import { z } from "zod";
import {
  requireOrganizationOwner,
  checkOrganizationRole,
  canManageUserRole,
} from "@/lib/role-utils";
import { getAssignableRoles, canChangeUserRole } from "@/lib/role-permissions";
import type { OrganizationRole } from "@/interfaces";

export const getOrganizationInvitationsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { orgId: string | number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      // Check if user has permission to view invitations (ADMIN or above)
      const userRole = await checkOrganizationRole(userId, orgId);

      if (!userRole.hasAccess) {
        throw new Error("Forbidden: Access denied to this organization");
      }

      // Only ADMIN or above can view invitations
      const canViewInvitations =
        userRole.role === "SUPER_OWNER" ||
        userRole.role === "OWNER" ||
        userRole.role === "ADMIN";

      if (!canViewInvitations) {
        throw new Error("Forbidden: ADMIN role or higher required");
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
  .middleware([authMiddleware])
  .validator(
    (data: {
      invitationId: string;
      updatedRole: OrganizationRole;
      orgId: string | number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;

      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const invitationId = data.invitationId;
      const updatedRole = data.updatedRole;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      // Check if user has permission to manage invitations
      const userRole = await checkOrganizationRole(userId, orgId);

      if (!userRole.hasAccess) {
        throw new Error("Forbidden: Access denied to this organization");
      }

      // Check if user can assign the requested role
      const assignableRoles = getAssignableRoles(userRole.role);
      if (!assignableRoles.includes(updatedRole)) {
        throw new Error(`Forbidden: Cannot assign ${updatedRole} role`);
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

export const cancelOrganizationInvitationFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { invitationId: string; orgId: number }) => data)
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const invitationId = data.invitationId;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      // Check if user has permission to cancel invitations
      const userRole = await checkOrganizationRole(userId, orgId);

      if (!userRole.hasAccess) {
        throw new Error("Forbidden: Access denied to this organization");
      }

      // Only ADMIN or above can cancel invitations
      const canCancelInvitations =
        userRole.role === "SUPER_OWNER" ||
        userRole.role === "OWNER" ||
        userRole.role === "ADMIN";

      if (!canCancelInvitations) {
        throw new Error("Forbidden: ADMIN role or higher required");
      }

      await prismaClient.organizationInvitation.update({
        where: { id: invitationId },
        data: { status: "CANCELLED" },
      });

      return { success: true };
    } catch (error) {
      console.error("Error cancelling organization invitation:", error);
      throw new Error("Internal Server Error");
    }
  });

export const sendEmailFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { to: string; orgId: string | number }) => {
    return z
      .object({
        to: z.string().email(),
        orgId: z.union([z.string(), z.number()]),
      })
      .parse(data);
  })
  .handler(async ({ data, context }) => {
    try {
      const { user, valid } = context as AuthContext;

      if (!valid) {
        throw new Error("Unauthorized");
      }

      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;
      const orgId =
        typeof data.orgId === "string" ? parseInt(data.orgId) : data.orgId;

      const { hasAccess } = await requireOrganizationOwner(userId, orgId);

      if (!hasAccess) {
        throw new Error("Forbidden: OWNER role required");
      }

      const findOrganization = await prismaClient.organization.findUnique({
        where: { id: orgId },
      });

      if (!findOrganization) {
        throw new Error("Organization not found");
      }

      const { data: emailData, error } = await resend.emails.send({
        from: user.email || "",
        to: data.to,
        subject: `Invitation to join ${findOrganization.name} on .envShare`,
        html: `<p>You have been invited to join the organization. Click <a href="#">here</a> to accept the invitation.</p>`,
      });

      if (error) {
        console.error("Resend email error:", error);
        throw new Error("Failed to send email");
      }

      return {
        success: true,
        message: "Email sent successfully",
        data: emailData,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  });
