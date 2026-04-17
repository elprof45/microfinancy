import { Hono } from "hono";
import { prisma } from "../../lib/db";
import { ForbiddenError, NotFoundError } from "../lib/errors";
import { authMiddleware } from "../middleware/auth";
import { createResponse, createErrorResponse } from "../types/api";

const reportsRouter = new Hono();

// Apply auth middleware to all routes
reportsRouter.use("*", authMiddleware);

/**
 * GET /reports/dashboard
 * Top-level dashboard stats
 * All authenticated users
 */
reportsRouter.get("/dashboard", async (c) => {
  try {
    const userId = c.user?.id;
    const userRole = c.user?.role;
    const agenceId = c.user?.agenceId;
    const societeId = c.user?.societeId;

    // Build queries based on role
    const agencyFilter =
      userRole === "ADMIN" ? undefined : { id: agenceId };
    const clientFilter = {
      agenceId:
        userRole === "ADMIN"
          ? undefined
          : agenceId,
    };

    // Get stats
    const [
      totalClients,
      totalBalance,
      pendingMovements,
      totalCollectors,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.clientTotine.count({
        where: clientFilter,
      }),
      prisma.compte.aggregate({
        where: {
          agence: agencyFilter,
        },
        _sum: { solde: true },
      }),
      prisma.mouvementEpargne.count({
        where: {
          statut: "EN_ATTENTE",
          agenceId: agencyFilter?.id,
        },
      }),
      prisma.utilisateur.count({
        where: {
          role: "COLLECTEUR",
          agenceId: agencyFilter?.id,
        },
      }),
      prisma.mouvementEpargne.aggregate({
        where: {
          statut: "VALIDE",
          agenceId: agencyFilter?.id,
          dateMouvement: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { montant: true },
      }),
    ]);

    // Get alerts
    const rejectedMovements = await prisma.mouvementEpargne.count({
      where: {
        statut: "REJETE",
        agenceId: agencyFilter?.id,
      },
    });

    return c.json(
      createResponse(
        {
          timestamp: new Date().toISOString(),
          role: userRole,
          stats: {
            totalClients,
            totalBalance: totalBalance._sum.solde || 0,
            pendingApprovals: pendingMovements,
            activeCollectors: totalCollectors,
            monthlyRevenue: monthlyRevenue._sum.montant || 0,
          },
          alerts: {
            rejectedMovements,
            hasIssues: rejectedMovements > 0 || pendingMovements > 10,
          },
        },
        200
      )
    );
  } catch (error) {
    throw error;
  }
});

/**
 * GET /reports/agency/:id
 * Agency-specific statistics
 */
reportsRouter.get("/agency/:id", async (c) => {
  try {
    const agencyId = parseInt(c.req.param("id"));

    // Check access
    if (c.user?.role !== "ADMIN" && c.user?.agenceId !== agencyId) {
      throw new ForbiddenError("No access to this agency");
    }

    const agency = await prisma.agence.findUnique({
      where: { id: agencyId },
    });

    if (!agency) {
      throw new NotFoundError("Agency not found");
    }

    // Get agency stats
    const [
      clientCount,
      totalBalance,
      totalRevenue,
      totalMovements,
      collectors,
      topCollectors,
    ] = await Promise.all([
      prisma.clientTotine.count({
        where: { agenceId },
      }),
      prisma.compte.aggregate({
        where: { agenceId },
        _sum: { solde: true },
      }),
      prisma.mouvementEpargne.aggregate({
        where: {
          agenceId,
          statut: "VALIDE",
        },
        _sum: { montant: true },
      }),
      prisma.mouvementEpargne.count({
        where: { agenceId },
      }),
      prisma.utilisateur.findMany({
        where: {
          role: "COLLECTEUR",
          agenceId,
        },
        select: {
          id: true,
          nom: true,
        },
      }),
      prisma.utilisateur.findMany({
        where: {
          role: "COLLECTEUR",
          agenceId,
        },
        include: {
          clientTotines: true,
        },
        take: 5,
      }),
    ]);

    const collectorPerformance = topCollectors.map((collector) => ({
      id: collector.id,
      nom: collector.nom,
      clientCount: collector.clientTotines.length,
    }));

    return c.json(
      createResponse(
        {
          agency: {
            id: agency.id,
            nom: agency.nom,
            code: agency.code,
          },
          stats: {
            clientCount,
            totalBalance: totalBalance._sum.solde || 0,
            totalRevenue: totalRevenue._sum.montant || 0,
            totalMovements,
            activeCollectors: collectors.length,
          },
          collectorPerformance,
        },
        200
      )
    );
  } catch (error: any) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return c.json(
        createErrorResponse(error.message, error.statusCode),
        error.statusCode
      );
    }
    throw error;
  }
});

/**
 * GET /reports/collector/:id
 * Collector performance stats
 */
reportsRouter.get("/collector/:id", async (c) => {
  try {
    const collectorId = parseInt(c.req.param("id"));

    // Check access
    if (c.user?.role === "COLLECTEUR" && c.user?.id !== collectorId) {
      throw new ForbiddenError("Cannot view other collectors' data");
    }

    const collector = await prisma.utilisateur.findUnique({
      where: { id: collectorId },
      include: {
        clientTotines: true,
        cotisations: true,
      },
    });

    if (!collector) {
      throw new NotFoundError("Collector not found");
    }

    if (collector.role !== "COLLECTEUR") {
      throw new ForbiddenError("User is not a collector");
    }

    // Get collector stats
    const monthlyCollections = await prisma.cotisation.aggregate({
      where: {
        agentCollecteurId: collectorId,
      },
      _sum: { mise: true },
      _count: true,
    });

    return c.json(
      createResponse(
        {
          collector: {
            id: collector.id,
            nom: collector.nom,
            email: collector.email,
          },
          stats: {
            managedClients: collector.clientTotines.length,
            totalCotisations: monthlyCollections._count,
            totalCollected: monthlyCollections._sum.mise || 0,
            averagePerCotisation:
              monthlyCollections._count > 0
                ? (monthlyCollections._sum.mise || 0) /
                  monthlyCollections._count
                : 0,
          },
        },
        200
      )
    );
  } catch (error: any) {
    if (error instanceof ForbiddenError || error instanceof NotFoundError) {
      return c.json(
        createErrorResponse(error.message, error.statusCode),
        error.statusCode
      );
    }
    throw error;
  }
});

/**
 * GET /reports/revenue
 * Revenue statistics by period and type
 */
reportsRouter.get("/revenue", async (c) => {
  try {
    const period = c.req.query("period") || "monthly"; // monthly, yearly

    // Get revenue by month (current year)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const revenueByMonth = await prisma.mouvementEpargne.groupBy({
      by: ["type"],
      where: {
        statut: "VALIDE",
        dateMouvement: {
          gte: startOfYear,
        },
        agenceId:
          c.user?.role === "ADMIN"
            ? undefined
            : c.user?.agenceId,
      },
      _sum: { montant: true },
    });

    // Get total revenue
    const totalRevenue = await prisma.mouvementEpargne.aggregate({
      where: {
        statut: "VALIDE",
        agenceId:
          c.user?.role === "ADMIN"
            ? undefined
            : c.user?.agenceId,
      },
      _sum: { montant: true },
    });

    return c.json(
      createResponse(
        {
          period,
          currentYear: now.getFullYear(),
          totalRevenue: totalRevenue._sum.montant || 0,
          revenueByType: revenueByMonth.map((item) => ({
            type: item.type,
            amount: item._sum.montant || 0,
          })),
        },
        200
      )
    );
  } catch (error) {
    throw error;
  }
});

/**
 * GET /reports/movements
 * Movement summary statistics
 */
reportsRouter.get("/movements", async (c) => {
  try {
    const [byStatus, byType, total] = await Promise.all([
      prisma.mouvementEpargne.groupBy({
        by: ["statut"],
        where: {
          agenceId:
            c.user?.role === "ADMIN"
              ? undefined
              : c.user?.agenceId,
        },
        _count: true,
        _sum: { montant: true },
      }),
      prisma.mouvementEpargne.groupBy({
        by: ["type"],
        where: {
          agenceId:
            c.user?.role === "ADMIN"
              ? undefined
              : c.user?.agenceId,
        },
        _sum: { montant: true },
      }),
      prisma.mouvementEpargne.aggregate({
        where: {
          agenceId:
            c.user?.role === "ADMIN"
              ? undefined
              : c.user?.agenceId,
        },
        _sum: { montant: true },
        _count: true,
      }),
    ]);

    return c.json(
      createResponse(
        {
          totalMovements: total._count,
          totalAmount: total._sum.montant || 0,
          byStatus: byStatus.map((item) => ({
            status: item.statut,
            count: item._count,
            amount: item._sum.montant || 0,
          })),
          byType: byType.map((item) => ({
            type: item.type,
            amount: item._sum.montant || 0,
          })),
        },
        200
      )
    );
  } catch (error) {
    throw error;
  }
});

export default reportsRouter;
