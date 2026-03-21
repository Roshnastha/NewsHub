import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "publisher",
        status: "pending",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}