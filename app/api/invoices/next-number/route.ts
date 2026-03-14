import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAuth();

    // Get the latest invoice created
    const latestInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: "desc" },
      select: { invoiceNumber: true },
    });

    let nextNumber = "INV-0001";

    if (latestInvoice?.invoiceNumber) {
      const match = latestInvoice.invoiceNumber.match(/INV-(\d+)/);
      if (match && match[1]) {
        const currentNum = parseInt(match[1], 10);
        const nextNum = currentNum + 1;
        nextNumber = `INV-${nextNum.toString().padStart(4, "0")}`;
      }
    }

    return NextResponse.json({ nextNumber });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
