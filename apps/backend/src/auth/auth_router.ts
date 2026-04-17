import { Hono } from "hono";
import { prisma } from "../../lib/db";
import {
  hashPassword,
  comparePassword,
  generateTokenPair,
  verifyToken,
} from "../lib/auth";
import {
  AuthError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../lib/errors";
import {
  LoginSchema,
  RegisterSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  RefreshTokenSchema,
} from "../validation/schemas";
import {
  validateBody,
  getValidatedBody,
} from "../middleware/validate";
import { createResponse, createErrorResponse } from "../types/api";

const authRouter = new Hono();

/**
 * POST /auth/login
 * Login with email and password, return access + refresh tokens
 */
authRouter.post("/login", validateBody(LoginSchema), async (c) => {
  try {
    const { email, password } = getValidatedBody(c);

    // Find user by email
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AuthError("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthError("This account has been deactivated");
    }

    // Compare passwords
    const isValidPassword = await comparePassword(password, user.motDePasseHash);
    if (!isValidPassword) {
      throw new AuthError("Invalid email or password");
    }

    // Update last login
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      agenceId: user.agenceId,
      societeId: user.societeId,
    });

    return c.json(
      createResponse(
        {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            nom: user.nom,
            role: user.role,
            agenceId: user.agenceId,
            societeId: user.societeId,
          },
        },
        200
      )
    );
  } catch (error: any) {
    if (error instanceof AuthError) {
      return c.json(createErrorResponse(error.message, error.statusCode), error.statusCode);
    }
    throw error;
  }
});

/**
 * POST /auth/register
 * Register a new user (admin endpoint - only ADMIN can create users)
 * For now, allow first user registration for bootstrapping
 */
authRouter.post("/register", validateBody(RegisterSchema), async (c) => {
  try {
    const data = getValidatedBody(c);

    // Check if email already exists
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.utilisateur.create({
      data: {
        email: data.email,
        nom: data.nom,
        motDePasseHash: passwordHash,
        role: data.role || "CAISSIER",
        telephone: data.telephone,
        agenceId: data.agenceId,
        societeId: data.societeId,
        isActive: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      agenceId: user.agenceId,
      societeId: user.societeId,
    });

    return c.json(
      createResponse(
        {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            nom: user.nom,
            role: user.role,
            agenceId: user.agenceId,
            societeId: user.societeId,
          },
        },
        201
      ),
      201
    );
  } catch (error: any) {
    if (error instanceof ConflictError) {
      return c.json(createErrorResponse(error.message, error.statusCode), error.statusCode);
    }
    throw error;
  }
});

/**
 * POST /auth/refresh
 * Use refresh token to get a new access token
 */
authRouter.post("/refresh", validateBody(RefreshTokenSchema), async (c) => {
  try {
    const { refreshToken } = getValidatedBody(c);

    // Verify refresh token
    const payload = verifyToken(refreshToken);
    if (!payload) {
      throw new AuthError("Invalid or expired refresh token");
    }

    // Get user to verify it still exists and is active
    const user = await prisma.utilisateur.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.isActive) {
      throw new AuthError("User not found or inactive");
    }

    // Generate new access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
      agenceId: user.agenceId,
      societeId: user.societeId,
    });

    return c.json(
      createResponse(
        {
          accessToken,
          refreshToken: newRefreshToken,
        },
        200
      )
    );
  } catch (error: any) {
    if (error instanceof AuthError) {
      return c.json(createErrorResponse(error.message, error.statusCode), error.statusCode);
    }
    throw error;
  }
});

/**
 * POST /auth/password-reset
 * Request password reset (placeholder - would send email in production)
 */
authRouter.post(
  "/password-reset",
  validateBody(PasswordResetRequestSchema),
  async (c) => {
    try {
      const { email } = getValidatedBody(c);

      // Check if user exists
      const user = await prisma.utilisateur.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if email exists (security best practice)
        return c.json(
          createResponse(
            { message: "If email exists, password reset link has been sent" },
            200
          )
        );
      }

      // TODO: Generate reset token and send email
      // For now, just return success
      console.log(`Password reset requested for user: ${email}`);

      return c.json(
        createResponse(
          { message: "Password reset link has been sent to your email" },
          200
        )
      );
    } catch (error) {
      throw error;
    }
  }
);

/**
 * POST /auth/password-reset/confirm
 * Confirm password reset with token
 */
authRouter.post(
  "/password-reset/confirm",
  validateBody(PasswordResetConfirmSchema),
  async (c) => {
    try {
      const { token, newPassword } = getValidatedBody(c);

      // TODO: Verify reset token (would need to store tokens in DB)
      // For now, this is a placeholder
      throw new ValidationError("Password reset functionality not yet implemented");
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return c.json(createErrorResponse(error.message, error.statusCode), error.statusCode);
      }
      throw error;
    }
  }
);

/**
 * POST /auth/logout
 * Client-side logout (token invalidation)
 * Just returns success - actual token invalidation would require token blacklisting
 */
authRouter.post("/logout", async (c) => {
  return c.json(
    createResponse({ message: "Logged out successfully" }, 200)
  );
});

export default authRouter;
