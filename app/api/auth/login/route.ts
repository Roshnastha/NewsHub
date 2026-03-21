import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check email verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before logging in" },
        { status: 401 },
      );
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Role-based checks
    if (role === "admin" && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have admin access" },
        { status: 403 },
      );
    }

    if (role === "publisher" && user.role !== "publisher") {
      return NextResponse.json(
        { error: "You do not have publisher access" },
        { status: 403 },
      );
    }

    if (user.role === "publisher" && user.status !== "approved") {
      return NextResponse.json(
        { error: "Your publisher account is pending admin approval." },
        { status: 401 },
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET);

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
