import { z } from "zod";

// Login DTO - matches the API request body
export const loginDtoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

export type LoginDto = z.infer<typeof loginDtoSchema>;
