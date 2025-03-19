export interface SessionDto {
  id: string;
  userId: string;
  expiresAt: string; // Note: API might return date as string
}