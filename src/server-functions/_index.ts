import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "@/hooks/useAppSession";
import dalInstance from "@/DAL";
import type { User } from "@/interfaces";

export const isUserAuthedFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const { data } = await useAppSession();

      if (data) {
        const userEmail = data.userEmail;

        if (!userEmail) {
          console.log("No user email found in session.");
          return false;
        }

        const user: User | null = await dalInstance.findUserByEmail(userEmail);

        if (!user) {
          console.log("User not found in database.");
          return false;
        }

        console.log("User is authenticated:", user.email);
        return true;
      } else {
        console.log("No session data found.");
        return false;
      }
    } catch (error) {
      console.error("Error checking user authentication:", error);
      return false;
    }
  },
);
