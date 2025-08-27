import jwt from "jsonwebtoken";
import { prismaClient } from "@/services/prisma";

export const SESSION_COOKIE_NAME = "envshare_session";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // 7 days

interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

// Generate JWT token
export const generateSessionToken = (user: {
  id: number;
  email: string;
}): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "envshare-app",
      audience: "envshare-users",
    },
  );
};

// Validate JWT token and get user
export const validateSessionToken = async (sessionToken: string) => {
  try {
    if (!sessionToken) {
      return { valid: false, user: null };
    }

    // Verify and decode JWT
    const decoded = jwt.verify(sessionToken, JWT_SECRET, {
      issuer: "envshare-app",
      audience: "envshare-users",
    }) as JWTPayload;

    // Get user from database to ensure they still exist
    const user = await prismaClient.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        organizationRoles: true,
        organizations: true,
        ownedOrganizations: true,
        ownedProjects: true,
        projectRoles: true,
        projects: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return { valid: false, user: null };
    }

    // Verify email matches (extra security check)
    if (user.email !== decoded.email) {
      return { valid: false, user: null };
    }

    return {
      valid: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.log("Invalid JWT token:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.log("JWT token expired:", error.message);
    } else {
      console.error("Error validating session token:", error);
    }
    return { valid: false, user: null };
  }
};

// Cookie configuration
export const cookieConfig = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
  path: "/",
};
