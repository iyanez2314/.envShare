import { createServerFn } from "@tanstack/react-start";
import { authMiddleware, AuthContext } from "@/middleware";
import { z } from "zod";
import { resend } from "@/services/resend";

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
  .handler(async ({ context }) => {
    try {
      const { user, valid } = context as AuthContext;

      if (!valid) {
        return { success: false, message: "Unauthorized" };
      }
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, message: "Failed to send email" };
    }
  });
