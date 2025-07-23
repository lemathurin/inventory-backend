export const TOKEN_CONFIG = {
  duration: "7d", // 7 days token duration
  refreshThreshold: 3 * 24 * 60, // Refresh after 3 days (converted to minutes)
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export interface TokenPayload {
  userId: string;
  iat: number;
  exp: number;
  // nonce: string;
}
