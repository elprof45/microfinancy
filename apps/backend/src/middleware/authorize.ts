import { Context, Next } from "hono";

/**
 * Role-based authorization middleware
 * Checks if the user has the required role
 *
 * @param allowedRoles - Array of role names that are allowed to access this route
 * @returns Middleware function
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    if (!c.user) {
      return c.json(
        {
          success: false,
          error: "Authentication required",
          statusCode: 401,
        },
        401
      );
    }

    if (!allowedRoles.includes(c.user.role)) {
      return c.json(
        {
          success: false,
          error: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          statusCode: 403,
        },
        403
      );
    }

    await next();
  };
};

/**
 * Check if user belongs to a specific agency
 * (Useful for scoping data access)
 */
export const requireAgency = (c: Context, agencyIdToCheck?: number): boolean => {
  if (!c.user) return false;
  if (!agencyIdToCheck) return true; // No agency check needed

  // ADMIN can access any agency, others can only access their own
  if (c.user.role === "ADMIN") return true;
  return c.user.agenceId === agencyIdToCheck;
};

/**
 * Check if user belongs to a specific society
 */
export const requireSociety = (
  c: Context,
  societyIdToCheck?: number
): boolean => {
  if (!c.user) return false;
  if (!societyIdToCheck) return true; // No society check needed

  // ADMIN can access any society, others can only access their own
  if (c.user.role === "ADMIN") return true;
  return c.user.societeId === societyIdToCheck;
};
