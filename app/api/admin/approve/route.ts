import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    // Send email notification
    await resend.emails.send({
      from: "NewsHub <onboarding@resend.dev>",
      to: user.email,
      subject:
        action === "approve"
          ? "Your NewsHub publisher account has been approved!"
          : "Your NewsHub publisher account request was rejected",
      html:
        action === "approve"
          ? `<h2>Congratulations ${user.name}!</h2>
           <p>Your publisher account has been approved. You can now log in and start creating articles.</p>
           <a href="${process.env.NEXTAUTH_URL}/login" 
              style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">
             Log In Now
           </a>`
          : `<h2>Hello ${user.name},</h2>
           <p>Unfortunately your publisher account request has been rejected. 
           Please contact us for more information.</p>`,
    });

    return NextResponse.json({ message: `User ${newStatus} successfully` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
