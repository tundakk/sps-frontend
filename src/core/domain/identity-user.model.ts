import { z } from "zod";

export const identityUserSchema = z.object({
  id: z.string().uuid(),
  userName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string().nullable().optional(),
  emailConfirmed: z.boolean().optional(),
  roles: z.array(z.string())
});

export type IdentityUserModel = z.infer<typeof identityUserSchema>;