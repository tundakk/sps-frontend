import { z } from "zod";
import { identityUserSchema } from "./identity-user.model";

export const sessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  expiresAt: z.date(),
  user: identityUserSchema,
  token: z.string()
});

export type SessionModel = z.infer<typeof sessionSchema>;

// Helper to create a Session from AuthResponseModel
export const createSessionFromAuth = (
  authResponse: import("./auth-response.model").AuthResponseModel
): SessionModel => {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + authResponse.expiresIn);
  
  return {
    id: crypto.randomUUID(),
    userId: authResponse.userId,
    expiresAt,
    token: authResponse.token,
    user: {
      id: authResponse.userId,
      userName: authResponse.userName,
      email: authResponse.email,
      roles: authResponse.roles
    }
  };
};