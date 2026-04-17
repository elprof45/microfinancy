import { Hono } from "hono";
import { prisma } from "../../lib/db";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/authorize";
import { createResponse, createErrorResponse } from "../types/api";

const workflowRouter = new Hono();

// Apply auth middleware to all routes
workflowRouter.use("*", authMiddleware);

/**
 * GET /workflows/mouvement-epargne/:id/status
 * Get current status and allowed transitions for a savings movement
 */
workflowRouter.get("/mouvement-epargne/:id/status", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const userId = c.user?.id;

    const mouvement = await prisma.mouvementEpargne.findUnique({
      where: { id },
      include: {
        creePar: true,
        agence: true,
      },
    });

    if (!mouvement) {
      throw new NotFoundError("Movement not found");
    }

    // Check if user has access
    if (
      c.user?.role !== "ADMIN" &&
      mouvement.agenceId !== c.user?.agenceId
    ) {
      throw new ForbiddenError("No access to this movement");
    }

    // Define allowed transitions based on current status and user role
    const allowedTransitions: Record<string, string[]> = {
      EN_ATTENTE: ["VALIDE", "REJETE"],
      VALIDE: ["ANNULE"],
      REJETE: ["EN_ATTENTE"],
      ANNULE: [],
      REMBOURSE: [],
    };

    const currentStatus = mouvement.statut;
    let allowed =
      allowedTransitions[currentStatus] ||
      [];

    // Only CAISSIER and ADMIN can approve/reject
    if (c.user?.role === "COLLECTEUR") {
      allowed = [];
    }

    return c.json(
      createResponse(
        {
          id: mouvement.id,
          reference: mouvement.reference,
          currentStatus,
          allowedTransitions: allowed,
          mouvement: {
            montant: mouvement.montant,
            dateMouvement: mouvement.dateMouvement,
            type: mouvement.type,
            observations: mouvement.observations,
          },
        },
        200
      )
    );
  } catch (error: any) {
    if (
      error instanceof ForbiddenError ||
      error instanceof NotFoundError
    ) {
      return c.json(
        createErrorResponse(error.message, error.statusCode),
        error.statusCode
      );
    }
    throw error;
  }
});

/**
 * POST /workflows/mouvement-epargne/:id/approve
 * Approve a movement (EN_ATTENTE → VALIDE)
 * Only CAISSIER or ADMIN
 */
workflowRouter.post(
  "/mouvement-epargne/:id/approve",
  requireRole(["ADMIN", "CAISSIER"]),
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      const userId = c.user?.id;

      const mouvement = await prisma.mouvementEpargne.findUnique({
        where: { id },
      });

      if (!mouvement) {
        throw new NotFoundError("Movement not found");
      }

      if (mouvement.statut !== "EN_ATTENTE") {
        throw new ForbiddenError(
          `Cannot approve movement with status: ${mouvement.statut}`
        );
      }

      // Update status
      const updated = await prisma.mouvementEpargne.update({
        where: { id },
        data: {
          statut: "VALIDE",
          valideParId: userId,
          updatedAt: new Date(),
        },
      });

      return c.json(
        createResponse(
          {
            id: updated.id,
            message: "Movement approved successfully",
            newStatus: updated.statut,
          },
          200
        )
      );
    } catch (error: any) {
      if (
        error instanceof ForbiddenError ||
        error instanceof NotFoundError
      ) {
        return c.json(
          createErrorResponse(error.message, error.statusCode),
          error.statusCode
        );
      }
      throw error;
    }
  }
);

/**
 * POST /workflows/mouvement-epargne/:id/reject
 * Reject a movement (EN_ATTENTE → REJETE)
 * Only CAISSIER or ADMIN
 */
workflowRouter.post(
  "/mouvement-epargne/:id/reject",
  requireRole(["ADMIN", "CAISSIER"]),
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      const body = await c.req.json<{ reason?: string }>();

      const mouvement = await prisma.mouvementEpargne.findUnique({
        where: { id },
      });

      if (!mouvement) {
        throw new NotFoundError("Movement not found");
      }

      if (mouvement.statut !== "EN_ATTENTE") {
        throw new ForbiddenError(
          `Cannot reject movement with status: ${mouvement.statut}`
        );
      }

      // Update with rejection reason in observations
      const updated = await prisma.mouvementEpargne.update({
        where: { id },
        data: {
          statut: "REJETE",
          observations: body.reason || mouvement.observations || "",
          updatedAt: new Date(),
        },
      });

      return c.json(
        createResponse(
          {
            id: updated.id,
            message: "Movement rejected",
            newStatus: updated.statut,
          },
          200
        )
      );
    } catch (error: any) {
      if (
        error instanceof ForbiddenError ||
        error instanceof NotFoundError
      ) {
        return c.json(
          createErrorResponse(error.message, error.statusCode),
          error.statusCode
        );
      }
      throw error;
    }
  }
);

/**
 * POST /workflows/mouvement-epargne/:id/cancel
 * Cancel a validated movement (VALIDE → ANNULE)
 * Only ADMIN
 */
workflowRouter.post(
  "/workflows/mouvement-epargne/:id/cancel",
  requireRole(["ADMIN"]),
  async (c) => {
    try {
      const id = parseInt(c.req.param("id"));
      const body = await c.req.json<{ reason?: string }>();

      const mouvement = await prisma.mouvementEpargne.findUnique({
        where: { id },
      });

      if (!mouvement) {
        throw new NotFoundError("Movement not found");
      }

      if (mouvement.statut !== "VALIDE") {
        throw new ForbiddenError(
          `Cannot cancel movement with status: ${mouvement.statut}`
        );
      }

      const updated = await prisma.mouvementEpargne.update({
        where: { id },
        data: {
          statut: "ANNULE",
          observations: body.reason || mouvement.observations || "",
          updatedAt: new Date(),
        },
      });

      return c.json(
        createResponse(
          {
            id: updated.id,
            message: "Movement cancelled",
            newStatus: updated.statut,
          },
          200
        )
      );
    } catch (error: any) {
      if (
        error instanceof ForbiddenError ||
        error instanceof NotFoundError
      ) {
        return c.json(
          createErrorResponse(error.message, error.statusCode),
          error.statusCode
        );
      }
      throw error;
    }
  }
);

/**
 * GET /workflows/cotisations/:id/status
 * Get current status for a cotisation
 */
workflowRouter.get("/cotisations/:id/status", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));

    const cotisation = await prisma.cotisation.findUnique({
      where: { id },
    });

    if (!cotisation) {
      throw new NotFoundError("Cotisation not found");
    }

    // For cotisations, status is based on isActif
    const status = cotisation.isActif ? "ACTIVE" : "INACTIVE";

    return c.json(
      createResponse(
        {
          id: cotisation.id,
          currentStatus: status,
          cotisation: {
            mois: cotisation.mois,
            annee: cotisation.annee,
            mise: cotisation.mise,
            isActif: cotisation.isActif,
          },
        },
        200
      )
    );
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return c.json(
        createErrorResponse(error.message, error.statusCode),
        error.statusCode
      );
    }
    throw error;
  }
});

/**
 * GET /workflows/pending
 * Get all pending transactions requiring approval
 * Only CAISSIER and ADMIN
 */
workflowRouter.get(
  "/pending",
  requireRole(["ADMIN", "CAISSIER"]),
  async (c) => {
    try {
      const agenceId =
        c.user?.role === "ADMIN"
          ? undefined
          : c.user?.agenceId;

      const pendingMovements = await prisma.mouvementEpargne.findMany({
        where: {
          statut: "EN_ATTENTE",
          agenceId: agenceId,
        },
        include: {
          client: true,
          compte: true,
          creePar: true,
        },
        orderBy: { dateMouvement: "asc" },
        take: 50,
      });

      return c.json(
        createResponse(
          {
            count: pendingMovements.length,
            movements: pendingMovements.map((m) => ({
              id: m.id,
              reference: m.reference,
              type: m.type,
              montant: m.montant,
              dateMouvement: m.dateMouvement,
              clientName: m.client?.nom,
              createdBy: m.creePar.nom,
              observations: m.observations,
            })),
          },
          200
        )
      );
    } catch (error) {
      throw error;
    }
  }
);

export default workflowRouter;
