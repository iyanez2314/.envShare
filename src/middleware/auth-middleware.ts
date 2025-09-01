import { createMiddleware } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { SESSION_COOKIE_NAME, validateSessionToken } from "@/lib/auth-utils";
import type { User } from "@/interfaces";

export interface AuthContext {
  user: User;
  valid: boolean;
}

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      const sessionToken = getCookie(SESSION_COOKIE_NAME) ?? "";

      if (!sessionToken) {
        throw new Error("No session token found");
      }

      const result = await validateSessionToken(sessionToken);

      if (!result.valid || !result.user) {
        setCookie(SESSION_COOKIE_NAME, "", {
          expires: new Date(0),
          path: "/",
        });
        throw new Error("Invalid or expired session token");
      }

      return next({
        context: {
          user: result.user,
          valid: true,
        } as AuthContext,
      });
    } catch (error) {
      console.error("Authentication middleware error:", error);
      throw new Error("Unauthorized");
    }
  },
);

