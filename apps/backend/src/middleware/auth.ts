import { Context, Next } from "hono";
import {
  extractTokenFromHeader,
  verifyToken,
  TokenPayload,
} from "../lib/auth";

declare global {
  namespace HonoRequest {
    interface HonoRequest {
      user?: TokenPayload;
    }
  }
}

// Extend context to include user
declare module "hono" {
  interface Context {
    user?: TokenPayload;
  }
}

/**
 * Auth middleware - verifies JWT token and extracts user info
 * Returns 401 if token is missing or invalid
 */
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return c.json(
      {
        success: false,
        error: "Missing or invalid Authorization header",
        statusCode: 401,
      },
      401
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return c.json(
      {
        success: false,
        error: "Invalid or expired token",
        statusCode: 401,
      },
      401
    );
  }

  // Attach user to context for downstream handlers
  c.user = payload;
  await next();
};
