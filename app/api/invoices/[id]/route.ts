/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();

    const invoice = await (prisma.invoice as any).findUnique({
      where: { id: params.id, deletedAt: null } as any,
      include: {
        assignee: { select: { id: true, name: true } },
      },
    });

    if (!invoice) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth();
    const body = await req.json();
    const data = invoiceSchema.parse(body);

    const invoice = await (prisma.invoice as any).findUnique({
      where: { id: params.id, deletedAt: null } as any,
    });

    if (!invoice) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const quantity = Number(data.quantity);
    const unitRate = Number(data.unitRate);
    const toleranceQuantity = Math.floor(quantity * 0.95);
    const totalAmount = quantity * unitRate;
    const advanceAmount = data.advancePaid ? Number(data.advanceAmount || 0) : null;
    let balance: number | null = totalAmount;
    if (data.advancePaid && advanceAmount !== null) {
      balance = totalAmount - advanceAmount;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedInvoice = await (tx as any).invoice.update({
        where: { id: params.id },
        data: {
          customerName: data.customerName,
          phone: data.phone,
          brideName: data.brideName || "",
          groomName: data.groomName || "",
          modelNumber: data.modelNumber || "",
          description: data.description,
          date: data.date ? new Date(data.date) : new Date(),
          quantity,
          toleranceQuantity,
          unitRate,
          totalAmount,
          advancePaid: data.advancePaid,
          advanceAmount,
          advanceMode: data.advancePaid && data.advanceMode ? data.advanceMode : null,
          balance,
          balancePaid: balance !== null && balance <= 0,
          balanceMode: data.balanceMode || null,
          estimatedDesignTime: data.estimatedDesignTime || "",
          estimatedPrintTime: data.estimatedPrintTime || "",
          packing: data.packing,
          printingColor: data.printingColor,
          designer: data.designer,
          printer: data.printer,
          additionalNotes: data.additionalNotes,
          contentConfirmedOn: data.contentConfirmedOn ? new Date(data.contentConfirmedOn) : null,
          finalDeliveryDate: data.finalDeliveryDate ? new Date(data.finalDeliveryDate) : null,
          assigneeId: data.assigneeId,
        },
      });

      // Update the denormalized fields in WIPCard and FinalCheck if they exist
      await (tx as any).wIPCard.updateMany({
        where: { invoiceId: params.id },
        data: {
          description: data.description,
          quantity,
          customerName: data.customerName,
        },
      });

      await (tx as any).finalCheck.updateMany({
        where: { invoiceId: params.id },
        data: {
          description: data.description,
          quantity,
          designer: data.designer || null,
          printer: data.printer || null,
          modelNumber: data.modelNumber || "",
        },
      });

      return updatedInvoice;
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("UPDATE INVOICE ERROR", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json((error as any).errors, { status: 422 });
    }
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth("ADMIN");

    // Soft delete logic
    await (prisma.invoice as any).update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        wipCard: { update: { deletedAt: new Date() } },
        finalCheck: { update: { deletedAt: new Date() } }
      } as any,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
