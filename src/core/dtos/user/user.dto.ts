import { z } from "zod";

// User DTO schema - matches API response from /Auth/me endpoint
export const userDtoSchema = z.object({
  id: z.string(),
  email: z.string().email("Invalid email format"),
  userName: z.string(),
  roles: z.array(z.string())
});

export type UserDto = z.infer<typeof userDtoSchema>;