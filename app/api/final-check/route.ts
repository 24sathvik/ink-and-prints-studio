/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    const finalChecks = await (prisma.finalCheck as any).findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        invoice: {
          select: {
            finalDeliveryDate: true,
            status: true,
            customerName: true,
          }
        }
      }
    });

    return NextResponse.json(finalChecks);
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
