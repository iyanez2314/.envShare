import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-utils";

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  try {
    setCookie(SESSION_COOKIE_NAME, "", {
      expires: new Date(0),
      path: "/",
    });

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Error during logout:", error);
    return {
      success: false,
      message: "Logout failed",
    };
  }
});

