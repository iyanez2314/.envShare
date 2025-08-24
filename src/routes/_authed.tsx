import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { prismaClient, hashPassword } from "@/services/prisma";
import { useAppSession } from "@/hooks/useAppSession";
import type { RouterContext } from "@/router";

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

    const session = await useAppSession();

    await session.update({
      userEmail: user.email,
    });
  });

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

    throw redirect({
      href: "/dashboard",
    });
  });

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context }: { context: RouterContext }) => {
    if (!context?.user) {
      throw new Error("Not authenticated");
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === "Not authenticated") {
      return;
    }

    throw error;
  },
});
