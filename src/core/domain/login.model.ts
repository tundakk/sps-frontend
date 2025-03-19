import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginModel = z.infer<typeof loginSchema>;
