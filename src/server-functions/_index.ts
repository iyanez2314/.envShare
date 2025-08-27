import { createServerFn } from "@tanstack/react-start";
import { setCookie, getCookie } from "@tanstack/react-start/server";
import { prismaClient, hashPassword } from "@/services/prisma";
import { useAppSession } from "@/hooks/useAppSession";
import {
  SESSION_COOKIE_NAME,
  generateSessionToken,
  validateSessionToken,
  cookieConfig,
} from "@/lib/auth-utils";

// Set user cookie server function
export const setUserCookieFn = createServerFn({ method: "POST" })
  .validator((data: { user: { id: number; email: string } }) => data)
  .handler(async ({ data }) => {
    try {
      const token = generateSessionToken(data.user);

      setCookie(SESSION_COOKIE_NAME, token, cookieConfig);

      return { success: true, token };
    } catch (error) {
      console.error("Error setting cookie:", error);
      return { success: false, error: error.message };
    }
  });

// Validate request using cookie
export const validateIncomingRequestFn = createServerFn({
  method: "GET",
}).handler(async () => {
  try {
    const sessionToken = getCookie(SESSION_COOKIE_NAME) ?? "";
    if (!sessionToken) {
      return { valid: false, user: null };
    }

    const result = await validateSessionToken(sessionToken);

    if (!result.valid) {
      setCookie(SESSION_COOKIE_NAME, "", {
        expires: new Date(0),
        path: "/",
      });
    }

    return result;
  } catch (error) {
    console.error("Error validating request:", error);
    return { valid: false, user: null };
  }
});

// Clear user cookie
export const clearUserCookieFn = createServerFn({ method: "POST" }).handler(
  async () => {
    try {
      setCookie(SESSION_COOKIE_NAME, "", {
        expires: new Date(0),
        path: "/",
      });
      return { success: true };
    } catch (error) {
      console.error("Error clearing cookie:", error);
      return { success: false };
    }
  },
);

// Legacy auth check (keeping for backward compatibility)
export const isUserAuthedFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await validateIncomingRequestFn();
    return result.valid;
  },
);

// Login server function
export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { email, password } = data;

    const user = await prismaClient.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        error: true,
        userNotFound: true,
        message: "User not found",
      };
    }

    const hashedPassword = await hashPassword(password);

    if (user.password !== hashedPassword) {
      return {
        error: true,
        message: "Incorrect password",
      };
    }

    // Set session
    const session = await useAppSession();
    await session.update({
      userEmail: user.email,
    });

    // Set cookie
    const token = generateSessionToken({ id: user.id, email: user.email });
    setCookie(SESSION_COOKIE_NAME, token, cookieConfig);

    return { success: true };
  });

// Signup server function
export const signUpFn = createServerFn({ method: "POST" })
  .validator((data: { name: string; email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const { name, email, password } = data;

    const existingUser = await prismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: true,
        userExists: true,
        message: "User already exists",
      };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const session = await useAppSession();
    await session.update({
      userEmail: newUser.email,
    });

    // Set cookie
    const token = generateSessionToken({
      id: newUser.id,
      email: newUser.email,
    });
    setCookie(SESSION_COOKIE_NAME, token, cookieConfig);

    return { success: true };
  });
