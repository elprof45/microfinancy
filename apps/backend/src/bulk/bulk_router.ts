import { Hono } from "hono";
import { prisma } from "../../lib/db";
import { ForbiddenError, ValidationError } from "../lib/errors";
import { authMiddleware } from "../middleware/auth";
import { requireRole } from "../middleware/authorize";
import { createResponse, createErrorResponse } from "../types/api";

const bulkRouter = new Hono();

// Apply auth middleware to all routes
bulkRouter.use("*", authMiddleware);

interface ClientImportRow {
  numeroClient: string;
  nom: string;
  telephone?: string;
  email?: string;
  agentCollecteurId?: number;
}

interface CotisationImportRow {
  clientId: number;
  mois: string;
  annee: number;
  mise: number;
}

/**
 * POST /bulk/import-clients
 * Import multiple clients from CSV
 * Expects JSON array of client objects
 */
bulkRouter.post(
  "/import-clients",
  requireRole(["ADMIN", "CAISSIER"]),
  async (c) => {
    try {
      const body = await c.req.json<{
        agenceId: number;
        clients: ClientImportRow[];
      }>();

      if (!body.agenceId) {
        throw new ValidationError("agenceId is required");
      }

      if (!Array.isArray(body.clients) || body.clients.length === 0) {
        throw new ValidationError("clients array is required and not empty");
      }

      // Verify agency exists and user has access
      const agency = await prisma.agence.findUnique({
        where: { id: body.agenceId },
      });

      if (!agency) {
        throw new ForbiddenError("Agency not found");
      }

      if (c.user?.role !== "ADMIN" && c.user?.agenceId !== body.agenceId) {
        throw new ForbiddenError("No access to this agency");
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ row: number; error: string }>,
        createdClients: [] as any[],
      };

      // Process each client
      for (let i = 0; i < body.clients.length; i++) {
        const client = body.clients[i];
        try {
          // Validate required fields
          if (!client.numeroClient || !client.nom) {
            throw new Error("numeroClient and nom are required");
          }

          // Check for duplicate
          const existing = await prisma.clientTotine.findUnique({
            where: { numeroClient: client.numeroClient },
          });

          if (existing) {
            throw new Error(`Client ${client.numeroClient} already exists`);
          }

          // Use provided collector ID or default to current user
          const collectorId =
            client.agentCollecteurId || c.user?.id;
          if (!collectorId) {
            throw new Error("No collector specified");
          }

          // Create client with account and passbook
          const newClient = await prisma.clientTotine.create({
            data: {
              numeroClient: client.numeroClient,
              nom: client.nom,
              telephone: client.telephone,
              email: client.email,
              agenceId: body.agenceId,
              agentCollecteurId: collectorId,
            },
          });

          // Create default EPARGNE account
          await prisma.compte.create({
            data: {
              numeroCompte: `${newClient.numeroClient}-EPARGNE`,
              typeCompte: "EPARGNE",
              clientId: newClient.id,
              agenceId: body.agenceId,
              deviseId: "XOF",
            },
          });

          // Create passbook
          await prisma.carnet.create({
            data: {
              numeroCarnet: `${newClient.numeroClient}-BOOK`,
              clientTotineId: newClient.id,
              agentCollecteurId: collectorId,
            },
          });

          results.success++;
          results.createdClients.push({
            id: newClient.id,
            numeroClient: newClient.numeroClient,
            nom: newClient.nom,
          });
        } catch (err: any) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: err.message,
          });
        }
      }

      return c.json(
        createResponse(
          {
            message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
            ...results,
          },
          201
        ),
        201
      );
    } catch (error: any) {
      if (error instanceof ValidationError || error instanceof ForbiddenError) {
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
 * POST /bulk/import-cotisations
 * Import multiple cotisations from CSV
 */
bulkRouter.post(
  "/import-cotisations",
  requireRole(["ADMIN", "CAISSIER", "COLLECTEUR"]),
  async (c) => {
    try {
      const body = await c.req.json<{
        agenceId: number;
        cotisations: CotisationImportRow[];
      }>();

      if (!body.agenceId) {
        throw new ValidationError("agenceId is required");
      }

      if (!Array.isArray(body.cotisations) || body.cotisations.length === 0) {
        throw new ValidationError("cotisations array is required");
      }

      // Verify agency and access
      const agency = await prisma.agence.findUnique({
        where: { id: body.agenceId },
      });

      if (!agency) {
        throw new ForbiddenError("Agency not found");
      }

      if (c.user?.role !== "ADMIN" && c.user?.agenceId !== body.agenceId) {
        throw new ForbiddenError("No access to this agency");
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ row: number; error: string }>,
        createdCotisations: [] as any[],
      };

      for (let i = 0; i < body.cotisations.length; i++) {
        const cot = body.cotisations[i];
        try {
          // Validate
          if (!cot.clientId || !cot.mois || !cot.annee || !cot.mise) {
            throw new Error("clientId, mois, annee, and mise are required");
          }

          // Get client and carnet
          const client = await prisma.clientTotine.findUnique({
            where: { id: cot.clientId },
            include: { carnets: true },
          });

          if (!client) {
            throw new Error(`Client ${cot.clientId} not found`);
          }

          const carnet = client.carnets[0];
          if (!carnet) {
            throw new Error(`No passbook for client ${cot.clientId}`);
          }

          // Check for duplicate
          const existing = await prisma.cotisation.findFirst({
            where: {
              clientId: cot.clientId,
              carnetId: carnet.id,
              mois: cot.mois,
              annee: cot.annee,
            },
          });

          if (existing) {
            throw new Error(
              `Cotisation for ${cot.mois}/${cot.annee} already exists`
            );
          }

          // Create cotisation
          const newCot = await prisma.cotisation.create({
            data: {
              mois: cot.mois,
              annee: cot.annee,
              mise: cot.mise,
              clientId: cot.clientId,
              carnetId: carnet.id,
              agenceId: body.agenceId,
              agentCollecteurId: c.user?.id || 0,
              soldeDisponible: cot.mise,
            },
          });

          results.success++;
          results.createdCotisations.push({
            id: newCot.id,
            mois: newCot.mois,
            annee: newCot.annee,
            mise: newCot.mise,
          });
        } catch (err: any) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: err.message,
          });
        }
      }

      return c.json(
        createResponse(
          {
            message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
            ...results,
          },
          201
        ),
        201
      );
    } catch (error: any) {
      if (error instanceof ValidationError || error instanceof ForbiddenError) {
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
 * POST /bulk/validate-movements
 * Approve multiple movements at once
 */
bulkRouter.post(
  "/validate-movements",
  requireRole(["ADMIN", "CAISSIER"]),
  async (c) => {
    try {
      const body = await c.req.json<{ movementIds: number[] }>();

      if (!Array.isArray(body.movementIds) || body.movementIds.length === 0) {
        throw new ValidationError("movementIds array is required");
      }

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ id: number; error: string }>,
        updated: [] as number[],
      };

      // Update each movement
      for (const id of body.movementIds) {
        try {
          const mouvement = await prisma.mouvementEpargne.findUnique({
            where: { id },
          });

          if (!mouvement) {
            throw new Error("Movement not found");
          }

          if (mouvement.statut !== "EN_ATTENTE") {
            throw new Error(`Cannot approve movement with status: ${mouvement.statut}`);
          }

          await prisma.mouvementEpargne.update({
            where: { id },
            data: {
              statut: "VALIDE",
              valideParId: c.user?.id,
            },
          });

          results.success++;
          results.updated.push(id);
        } catch (err: any) {
          results.failed++;
          results.errors.push({
            id,
            error: err.message,
          });
        }
      }

      return c.json(
        createResponse(
          {
            message: `Validation completed: ${results.success} succeeded, ${results.failed} failed`,
            ...results,
          },
          200
        )
      );
    } catch (error: any) {
      if (error instanceof ValidationError) {
        return c.json(
          createErrorResponse(error.message, error.statusCode),
          error.statusCode
        );
      }
      throw error;
    }
  }
);

export default bulkRouter;
