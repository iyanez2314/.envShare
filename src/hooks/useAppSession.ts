import { useSession } from "@tanstack/react-start/server";
import type { User } from "@prisma/client";

type SessionUser = {
  userEmail: User["email"];
};

export function useAppSession() {
  return useSession<SessionUser>({
    password:
      process.env.SESSION_SECRET ||
      "your-super-secret-session-password-at-least-32-chars-long",
  });
}
