import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=InvalidToken`
      );
    }

    const user = await prisma.user.findUnique({
      where: { verifyToken: token },
    });

    if (!user || !user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/login?error=TokenExpired`
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?verified=true`
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/login?error=ServerError`
    );
  }
}