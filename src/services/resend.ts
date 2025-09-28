import { Resend } from "resend";
if (!process.env.resend_api_key) {
  throw new Error("Missing resend_api_key env variable");
}

export const resend = new Resend(process.env.resend_api_key);
