/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // cache for 60 seconds

export async function GET() {
  try {
    await requireAuth();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalInvoices,
      activeInvoices,
      deliveriesThisWeek,
      overdueInvoices,
      totalLeads,
      wipCounts,
      urgentDeliveries,
      recentInvoices,
      leadsByStatus,
      pendingFinalChecks,
      completedFinalChecksThisMonth,
    ] = await Promise.all([
      // 1. Total Invoices
      (prisma.invoice as any).count({ where: { deletedAt: null } }),

      // 2. Active Invoices
      (prisma.invoice as any).count({ where: { deletedAt: null, status: "ACTIVE" } }),

      // 3. Deliveries This Week (ACTIVE, delivery within 7 days from now)
      (prisma.invoice as any).count({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          finalDeliveryDate: { gte: startOfToday, lte: in7Days },
        },
      }),

      // 4. Overdue Invoices
      (prisma.invoice as any).count({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          finalDeliveryDate: { lt: startOfToday },
        },
      }),

      // 5. Total Leads
      (prisma.lead as any).count({ where: { deletedAt: null } }),

      // 6. Active WIP Items — grouped by phase
      (prisma.wIPCard as any).groupBy({
        by: ["phase"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),

      // Urgent Deliveries (next 48 hours)
      (prisma.invoice as any).findMany({
        where: {
          deletedAt: null,
          status: "ACTIVE",
          finalDeliveryDate: { gte: startOfToday, lte: in48Hours },
        },
        orderBy: { finalDeliveryDate: "asc" },
        select: {
          id: true,
          invoiceNumber: true,
          customerName: true,
          finalDeliveryDate: true,
          assignee: { select: { name: true } },
        },
      }),

      // Recent 10 Invoices
      (prisma.invoice as any).findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          invoiceNumber: true,
          customerName: true,
          totalAmount: true,
          finalDeliveryDate: true,
          status: true,
          assignee: { select: { name: true } },
        },
      }),

      // Leads grouped by status
      (prisma.lead as any).groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),

      // Pending Final Checks (not complete)
      (prisma.finalCheck as any).count({ where: { deletedAt: null, isComplete: false } }),

      // Final Checks completed this month
      (prisma.finalCheck as any).count({
        where: {
          deletedAt: null,
          isComplete: true,
          completedAt: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
    ]);

    // Process WIP counts into a flat object
    const wipPhases: Record<string, number> = {
      RAW_MATERIALS: 0,
      DESIGN: 0,
      PRINTING: 0,
      POST_PRINTING: 0,
    };
    (wipCounts as any[]).forEach((g: any) => {
      wipPhases[g.phase] = g._count._all;
    });
    const totalWip = Object.values(wipPhases).reduce((a, b) => a + b, 0);

    // Process leads by status
    const leadsStatusMap: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      NEGOTIATING: 0,
      CONVERTED: 0,
      LOST: 0,
    };
    (leadsByStatus as any[]).forEach((g: any) => {
      leadsStatusMap[g.status] = g._count._all;
    });

    return NextResponse.json({
      stats: {
        totalInvoices,
        activeInvoices,
        deliveriesThisWeek,
        overdueInvoices,
        totalLeads,
        totalWip,
      },
      wipPhases,
      urgentDeliveries,
      recentInvoices,
      leadsByStatus: Object.entries(leadsStatusMap).map(([status, count]) => ({ status, count })),
      finalCheck: {
        pending: pendingFinalChecks,
        completedThisMonth: completedFinalChecksThisMonth,
      },
    });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
