/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await req.json();
    
    // allow partial updates of any fields
    const updated = await (prisma.finalCheck as any).update({
      where: { id: params.id },
      data: body,
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

    // We can also trigger invoice status = CLOSED if isComplete becomes true
    if (body.isComplete) {
       await (prisma.invoice as any).update({
         where: { id: updated.invoiceId },
         data: { status: "CLOSED" }
       });
    }

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth("ADMIN");

    const deleted = await (prisma.finalCheck as any).update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json(deleted);
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
