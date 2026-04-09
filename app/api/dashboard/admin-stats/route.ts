export const dynamic = "force-dynamic";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth-helpers";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: Request) {
  try {
    const session = await auth();
    requireRole(session, "ADMIN"); // Protected
    
    const rateLimitResponse = checkRateLimit(req, session?.user?.id || null, 50);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(req.url);
    const numMonths = parseInt(searchParams.get("months") || "12");
    const catStartStr = searchParams.get("catStart");
    const catEndStr = searchParams.get("catEnd");
    
    // Fetch net profit truth from accounts/summary
    const accountsUrl = new URL(req.url);
    accountsUrl.pathname = "/api/accounts/summary";
    accountsUrl.search = "";
    
    let accountsTrend: Record<string, number> = {};
    try {
      // Must forward cookies/auth headers
      const accRes = await fetch(accountsUrl.toString(), { 
        headers: req.headers,
        cache: 'no-store' 
      });
      if (accRes.ok) {
        const accJson = await accRes.json();
        if (accJson.success && accJson.data?.monthlySales) {
          accJson.data.monthlySales.forEach((s: any) => {
            accountsTrend[s.month] = s.profit;
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch accounts API for net profit", e);
    }

    const now = new Date();

    // Compute single date range covering all N months
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - numMonths + 1, 1);

    // Category Distribution date range
    const catStart = catStartStr ? new Date(catStartStr) : rangeStart;
    const catEnd = catEndStr ? (() => { const d = new Date(catEndStr); d.setHours(23, 59, 59, 999); return d; })() : now;

    // Fetch ALL invoices in range + category dist in one parallel shot — 2 queries instead of N+1
    const [allInvoices, categoriesAggr] = await Promise.all([
      (prisma.invoice as any).findMany({
        where: { createdAt: { gte: rangeStart, lte: now }, deletedAt: null },
        select: { totalAmount: true, createdAt: true },
      }),
      (prisma.invoice as any).groupBy({
        by: ['category'],
        where: { createdAt: { gte: catStart, lte: catEnd }, deletedAt: null },
        _sum: { totalAmount: true },
      })
    ]);

    // Bucket invoice data by month in JS
    const monthlyData = [];
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();

      const monthKey = d.toLocaleString("en-IN", { month: "short", year: "numeric" });
      const netProfit = accountsTrend[monthKey] ?? 0;

      const monthInvoices = allInvoices.filter((inv: any) => {
        const t = new Date(inv.createdAt).getTime();
        return t >= mStart && t < mEnd;
      });

      monthlyData.push({
        month: monthKey,
        totalInvoices: monthInvoices.length,
        revenue: monthInvoices.reduce((s: number, inv: any) => s + Number(inv.totalAmount || 0), 0),
        netProfit,
      });
    }

    const categoryDistribution = categoriesAggr
      .map((c: any) => ({
        name: c.category || "Uncategorized",
        value: Number(c._sum.totalAmount || 0)
      }))
      .filter((c: any) => c.value > 0)
      .sort((a: any, b: any) => b.value - a.value);

    return NextResponse.json({ 
      success: true, 
      data: {
        monthlyData,
        categoryDistribution
      } 
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
