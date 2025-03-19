import { z } from "zod";

export const placeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(100),
  placeNumber: z.string().max(50),
  alias: z.string().max(100).optional()
});

export type PlaceModel = z.infer<typeof placeSchema>;
