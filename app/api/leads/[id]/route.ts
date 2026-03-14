/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations";
import { z } from "zod";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = leadSchema.parse(body);

    const lead = await (prisma.lead as any).update({
      where: { id: params.id },
      data,
      include: { assignedTo: { select: { id: true, name: true } } }
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth("ADMIN"); // Only admins can delete

    const lead = await (prisma.lead as any).update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(lead);
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
