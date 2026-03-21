import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role = 'reader' } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        status: "pending",
        verifyToken,
        verifyTokenExpiry,
      },
    });

    const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${verifyToken}`;
    await resend.emails.send({
      from: "NewsHub <onboarding@resend.dev>",
      to: email,
      subject: "Verify your NewsHub account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to NewsHub!</h2>
          <p>Hi ${name}, please verify your email by clicking the button below:</p>
          <a href="${verifyUrl}" 
             style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;
                    border-radius:6px;text-decoration:none;margin:16px 0;">
            Verify Email
          </a>
          <p style="color:#666;">This link expires in 24 hours.</p>
          ${role === 'publisher' ? '<p style="color:#666;">Your publisher account will be reviewed by an admin after verification.</p>' : ''}
          <p style="color:#666;">If you did not create an account, ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: role === 'publisher'
        ? "Publisher account requested! Please verify your email. An admin will review your account after verification."
        : "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}