import { z } from "zod";

export const authResponseSchema = z.object({
  token: z.string(),
  expiresIn: z.number(), // seconds
  userId: z.string().uuid(),
  email: z.string().email(),
  userName: z.string(),
  roles: z.array(z.string())
});

export type AuthResponseModel = z.infer<typeof authResponseSchema>;