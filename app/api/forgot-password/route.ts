import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";
import { v4 as uuidv4 } from "uuid";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "If your email is registered, you will receive a reset link shortly.",
        },
        { status: 200 }
      );
    }

    // Generate a password reset token
    const resetToken = uuidv4();
    user.token = resetToken;
    user.tokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/api/reset-password?token=${resetToken}&email=${email}`;

    const message = {
      to: email,
      from: process.env.SEND_FROM_EMAIL as string,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    await sendgrid.send(message);

    return NextResponse.json(
      {
        message:
          "If your email is registered, you will receive a reset link shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in forgot password API:", error);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
