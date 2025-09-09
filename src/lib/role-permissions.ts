import type { OrganizationRole, RolePermissions } from "@/interfaces";

/**
 * Role hierarchy levels (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
  SUPER_OWNER: 4,
};

/**
 * Get the permission set for a given organization role
 */
export function getRolePermissions(role: OrganizationRole): RolePermissions {
  switch (role) {
    case "SUPER_OWNER":
      return {
        canAddMembers: true,
        canRemoveMembers: true,
        canManageProjects: true,
        canManageAdmins: true,
        canManageOwners: true,
        canTransferSuperOwnership: true,
        canRemoveOrganization: true,
      };

    case "OWNER":
      return {
        canAddMembers: true,
        canRemoveMembers: true,
        canManageProjects: true,
        canManageAdmins: true,
        canManageOwners: false, // Cannot manage other owners
        canTransferSuperOwnership: false,
        canRemoveOrganization: false,
      };

    case "ADMIN":
      return {
        canAddMembers: true,
        canRemoveMembers: true, // Can remove members only
        canManageProjects: true,
        canManageAdmins: false, // Cannot manage other admins
        canManageOwners: false,
        canTransferSuperOwnership: false,
        canRemoveOrganization: false,
      };

    case "MEMBER":
      return {
        canAddMembers: false,
        canRemoveMembers: false,
        canManageProjects: false,
        canManageAdmins: false,
        canManageOwners: false,
        canTransferSuperOwnership: false,
        canRemoveOrganization: false,
      };

    default:
      // Default to most restrictive permissions
      return getRolePermissions("MEMBER");
  }
}

/**
 * Check if a user can remove another user based on their roles
 */
export function canRemoveUser(
  removerRole: OrganizationRole,
  targetRole: OrganizationRole
): boolean {
  const removerLevel = ROLE_HIERARCHY[removerRole];
  const targetLevel = ROLE_HIERARCHY[targetRole];

  // Super owner can remove anyone except themselves (handled elsewhere)
  if (removerRole === "SUPER_OWNER") {
    return targetRole !== "SUPER_OWNER";
  }

  // Owners can remove admins and members, but not other owners or super owner
  if (removerRole === "OWNER") {
    return targetRole === "ADMIN" || targetRole === "MEMBER";
  }

  // Admins can only remove members
  if (removerRole === "ADMIN") {
    return targetRole === "MEMBER";
  }

  // Members cannot remove anyone
  return false;
}

/**
 * Check if a user can change another user's role
 */
export function canChangeUserRole(
  changerRole: OrganizationRole,
  targetCurrentRole: OrganizationRole,
  targetNewRole: OrganizationRole
): boolean {
  // Super owner can change anyone's role (except their own, which requires transfer)
  if (changerRole === "SUPER_OWNER" && targetCurrentRole !== "SUPER_OWNER") {
    return true;
  }

  // Owners can promote/demote admins and members, but cannot create other owners
  if (changerRole === "OWNER") {
    const canManageTarget = targetCurrentRole === "ADMIN" || targetCurrentRole === "MEMBER";
    const validNewRole = targetNewRole === "ADMIN" || targetNewRole === "MEMBER";
    return canManageTarget && validNewRole;
  }

  // Admins and members cannot change roles
  return false;
}

/**
 * Get the list of roles that a user can assign to others
 */
export function getAssignableRoles(userRole: OrganizationRole): OrganizationRole[] {
  switch (userRole) {
    case "SUPER_OWNER":
      return ["OWNER", "ADMIN", "MEMBER"];
    case "OWNER":
      return ["ADMIN", "MEMBER"];
    case "ADMIN":
      return ["MEMBER"];
    case "MEMBER":
      return [];
    default:
      return [];
  }
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: OrganizationRole): string {
  switch (role) {
    case "SUPER_OWNER":
      return "Super Owner";
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    case "MEMBER":
      return "Member";
    default:
      return "Unknown";
  }
}

/**
 * Get role description for UI
 */
export function getRoleDescription(role: OrganizationRole): string {
  switch (role) {
    case "SUPER_OWNER":
      return "Full control over organization, can manage all roles and transfer ownership";
    case "OWNER":
      return "Can manage projects, admins, and members, but not other owners";
    case "ADMIN":
      return "Can manage projects and members, but not admin or owner roles";
    case "MEMBER":
      return "Can access assigned projects with read/write permissions";
    default:
      return "";
  }
}

/**
 * Get role badge variant for UI styling
 */
export function getRoleBadgeVariant(role: OrganizationRole): "default" | "secondary" | "destructive" | "outline" {
  switch (role) {
    case "SUPER_OWNER":
      return "default"; // Primary color for highest authority
    case "OWNER":
      return "secondary"; // Secondary color for high authority
    case "ADMIN":
      return "outline"; // Outline for moderate authority
    case "MEMBER":
      return "outline"; // Outline for basic access
    default:
      return "outline";
  }
}

/**
 * Check if a role is considered "privileged" (owner level or above)
 */
export function isPrivilegedRole(role: OrganizationRole): boolean {
  return role === "SUPER_OWNER" || role === "OWNER";
}

/**
 * Check if a role can invite new members
 */
export function canInviteMembers(role: OrganizationRole): boolean {
  return getRolePermissions(role).canAddMembers;
}

/**
 * Validate if a role transition is allowed in the system
 */
export function isValidRoleTransition(
  fromRole: OrganizationRole,
  toRole: OrganizationRole
): boolean {
  // Super owner can only transition by transferring ownership
  if (fromRole === "SUPER_OWNER") {
    return false;
  }

  // All other role transitions are valid if properly authorized
  return true;
}