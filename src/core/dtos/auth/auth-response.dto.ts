import { z } from "zod";

// Authentication Response DTO - exactly matches API response
export const authResponseDtoSchema = z.object({
  token: z.string(),
  expiresIn: z.number(),
  userId: z.string(),
  email: z.string().email(),
  userName: z.string(),
  roles: z.array(z.string())
});

export type AuthResponseDto = z.infer<typeof authResponseDtoSchema>;

// Add a default export to ensure the file is recognized as a module
const _exportedForModule = { authResponseDtoSchema, AuthResponseDto: null as unknown as AuthResponseDto };
export default _exportedForModule;