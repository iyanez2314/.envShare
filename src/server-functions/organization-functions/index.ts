import { createServerFn } from "@tanstack/react-start";
import { validateIncomingRequestFn } from "../index";
import { prismaClient } from "@/services/prisma";

export const createOrganizationFn = createServerFn({ method: "POST" })
  .validator((data: { name: string; description?: string }) => data)
  .handler(async ({ data }) => {
    try {
      const { user, valid } = await validateIncomingRequestFn();

      if (!user || !valid) {
        throw new Error("Unauthorized");
      }

      const newOrg = await prismaClient.organization.create({
        data: {
          name: data.name,
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
