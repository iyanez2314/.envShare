import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware/auth-middleware";
import { prismaClient } from "@/services/prisma";
import { canManageUserRole, checkOrganizationRole } from "@/lib/role-utils";
import type { OrganizationRole } from "@/interfaces";

/**
 * Update a user's role in an organization with hierarchical permission checking
 */
export const updateUserRoleHierarchicalFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      userId: number;
      organizationId: number;
      newRole: OrganizationRole;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      const managerId = typeof user.id === "string" ? parseInt(user.id) : user.id;

      // Check if the manager can manage the target user
      const { canManage, error } = await canManageUserRole(
        managerId, 
        data.userId, 
        data.organizationId
      );

      if (!canManage) {
        return {
          success: false,
          error: error || "Insufficient permissions to manage this user"
        };
      }

      // Prevent setting SUPER_OWNER role (only transfers are allowed)
      if (data.newRole === "SUPER_OWNER") {
        return {
          success: false,
          error: "Cannot assign SUPER_OWNER role. Use transfer ownership instead."
        };
      }

      // Update the user's role
      const updatedRole = await prismaClient.userOrganizationRole.update({
        where: {
          userId_organizationId: {
            userId: data.userId,
            organizationId: data.organizationId,
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

      return { 
        success: true, 
        data: updatedRole,
        message: `User role updated to ${data.newRole}` 
      };

    } catch (error) {
      console.error("Error updating user role:", error);
      return {
        success: false,
        error: "Failed to update user role"
      };
    }
  });

/**
 * Remove a user from an organization with hierarchical permission checking
 */
export const removeUserHierarchicalFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      userId: number;
      organizationId: number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      const managerId = typeof user.id === "string" ? parseInt(user.id) : user.id;

      // Check if the manager can manage the target user
      const { canManage, error } = await canManageUserRole(
        managerId, 
        data.userId, 
        data.organizationId
      );

      if (!canManage) {
        return {
          success: false,
          error: error || "Insufficient permissions to remove this user"
        };
      }

      // Check if trying to remove the super owner
      const targetRole = await checkOrganizationRole(data.userId, data.organizationId);
      if (targetRole.role === "SUPER_OWNER") {
        return {
          success: false,
          error: "Cannot remove the super owner. Transfer ownership first."
        };
      }

      // Remove the user's organization role
      await prismaClient.userOrganizationRole.delete({
        where: {
          userId_organizationId: {
            userId: data.userId,
            organizationId: data.organizationId,
          },
        },
      });

      // Remove the user from the organization
      await prismaClient.organization.update({
        where: { id: data.organizationId },
        data: {
          users: {
            disconnect: { id: data.userId },
          },
        },
      });

      // Also remove from all projects in the organization
      await prismaClient.userProjectRole.deleteMany({
        where: {
          userId: data.userId,
          project: {
            organizationId: data.organizationId,
          },
        },
      });

      return { 
        success: true, 
        message: "User removed from organization successfully" 
      };

    } catch (error) {
      console.error("Error removing user from organization:", error);
      return {
        success: false,
        error: "Failed to remove user from organization"
      };
    }
  });

/**
 * Transfer super ownership to another user
 */
export const transferSuperOwnershipFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      newSuperOwnerId: number;
      organizationId: number;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      const currentUserId = typeof user.id === "string" ? parseInt(user.id) : user.id;

      // Verify current user is the super owner
      const currentUserRole = await checkOrganizationRole(currentUserId, data.organizationId);
      if (currentUserRole.role !== "SUPER_OWNER") {
        return {
          success: false,
          error: "Only the super owner can transfer ownership"
        };
      }

      // Verify target user exists in the organization
      const targetUserRole = await checkOrganizationRole(data.newSuperOwnerId, data.organizationId);
      if (!targetUserRole.hasAccess) {
        return {
          success: false,
          error: "Target user is not a member of this organization"
        };
      }

      // Perform the transfer in a transaction
      const result = await prismaClient.$transaction(async (tx) => {
        // Update the organization's superOwnerId
        await tx.organization.update({
          where: { id: data.organizationId },
          data: { 
            superOwnerId: data.newSuperOwnerId,
            // Keep legacy ownerId for compatibility during migration
            ownerId: data.newSuperOwnerId
          },
        });

        // Update the new super owner's role
        await tx.userOrganizationRole.update({
          where: {
            userId_organizationId: {
              userId: data.newSuperOwnerId,
              organizationId: data.organizationId,
            },
          },
          data: { role: "SUPER_OWNER" },
        });

        // Downgrade the current super owner to regular owner
        await tx.userOrganizationRole.update({
          where: {
            userId_organizationId: {
              userId: currentUserId,
              organizationId: data.organizationId,
            },
          },
          data: { role: "OWNER" },
        });

        return { success: true };
      });

      return {
        success: true,
        message: "Super ownership transferred successfully"
      };

    } catch (error) {
      console.error("Error transferring super ownership:", error);
      return {
        success: false,
        error: "Failed to transfer super ownership"
      };
    }
  });

/**
 * Get organization members with their hierarchical roles
 */
export const getOrganizationMembersHierarchicalFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: { organizationId: number }) => data,
  )
  .handler(async ({ data, context }) => {
    try {
      const { user } = context as AuthContext;
      const userId = typeof user.id === "string" ? parseInt(user.id) : user.id;

      // Check if user has access to view organization members
      const userRole = await checkOrganizationRole(userId, data.organizationId);
      if (!userRole.hasAccess) {
        return {
          success: false,
          error: "Access denied to this organization"
        };
      }

      // Get organization with all members and their roles
      const organization = await prismaClient.organization.findUnique({
        where: { id: data.organizationId },
        include: {
          superOwner: {
            select: { id: true, name: true, email: true }
          },
          userRoles: {
            include: {
              user: {
                select: { id: true, name: true, email: true, createdAt: true }
              }
            },
            orderBy: [
              { role: 'desc' }, // Super owner first, then owners, admins, members
              { createdAt: 'asc' }
            ]
          }
        }
      });

      if (!organization) {
        return {
          success: false,
          error: "Organization not found"
        };
      }

      // Format the response
      const members = organization.userRoles.map(userRole => ({
        id: userRole.user.id,
        name: userRole.user.name,
        email: userRole.user.email,
        role: userRole.role,
        addedAt: userRole.createdAt,
        isSuperOwner: userRole.role === 'SUPER_OWNER'
      }));

      return {
        success: true,
        data: {
          organization: {
            id: organization.id,
            name: organization.name,
            superOwnerId: organization.superOwnerId
          },
          members,
          currentUserRole: userRole.role
        }
      };

    } catch (error) {
      console.error("Error fetching organization members:", error);
      return {
        success: false,
        error: "Failed to fetch organization members"
      };
    }
  });