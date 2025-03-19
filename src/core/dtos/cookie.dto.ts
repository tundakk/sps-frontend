import { z } from "zod";

export const cookieAttributesSchema = z.object({
  expires: z.date().optional(),
  maxAge: z.number().optional(),
  domain: z.string().optional(),
  path: z.string().optional(),
  secure: z.boolean().optional(),
  httpOnly: z.boolean().optional(),
  sameSite: z.enum(['strict', 'lax', 'none']).optional()
});

export const cookieSchema = z.object({
  name: z.string(),
  value: z.string(),
  attributes: cookieAttributesSchema
});

export type CookieAttributes = z.infer<typeof cookieAttributesSchema>;
export type Cookie = z.infer<typeof cookieSchema>;

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}