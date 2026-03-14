/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL"; // or specific status
    const assigneeId = searchParams.get("assigneeId") || "";
    const sort = searchParams.get("sort") || "Newest"; // Newest | Oldest | Highest Value | Lowest Value

    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      const statuses = status.split(",");
      if (statuses.length > 0 && statuses[0] !== "") {
         where.status = { in: statuses };
      }
    }

    if (assigneeId && assigneeId !== "all") {
      where.assignedToId = assigneeId;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "Oldest") orderBy = { createdAt: "asc" };
    else if (sort === "Highest Value") orderBy = { estimatedBillValue: "desc" };
    else if (sort === "Lowest Value") orderBy = { estimatedBillValue: "asc" };

    const leads = await (prisma.lead as any).findMany({
      where,
      orderBy,
      include: {
        assignedTo: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(leads);
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = leadSchema.parse(body);

    const lead = await (prisma.lead as any).create({
      data: {
        ...data,
        createdById: user.id,
      },
      include: {
        assignedTo: { select: { id: true, name: true } },
      }
    });

    return NextResponse.json(lead);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json((error as any).errors, { status: 422 });
    }
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
