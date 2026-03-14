import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["ADMIN", "USER"]).optional(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAuth("ADMIN");

    const body = await req.json();
    
    // Check if this is a password reset or a regular update
    if (body.password) {
      const { password } = resetPasswordSchema.parse(body);
      const hashedPassword = await hash(password, 12);
      
      const user = await prisma.user.update({
        where: { id: params.id },
        data: { password: hashedPassword },
        select: { id: true, name: true, email: true, role: true },
      });
      return NextResponse.json(user);
    } else {
      const { name, role } = updateUserSchema.parse(body);
      const user = await prisma.user.update({
        where: { id: params.id },
        data: { name, role },
        select: { id: true, name: true, email: true, role: true },
      });
      return NextResponse.json(user);
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) return new NextResponse("Invalid data", { status: 422 });
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const sessionUser = await requireAuth("ADMIN");

    if (sessionUser.id === params.id) {
      return new NextResponse("Cannot delete yourself", { status: 400 });
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    if (error instanceof NextResponse) return error;
    return new NextResponse("Internal Error", { status: 500 });
  }
}
