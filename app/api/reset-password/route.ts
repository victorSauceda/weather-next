// app/api/reset-password.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";
import { getServerSession } from "next-auth";
import authOptions from "../../../lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    let email = searchParams.get("email");
    email = email ? email.replace(/ /g, "+") : null;

    const { newPassword, currentPassword } = await req.json();
    if (!newPassword) {
      return NextResponse.json(
        { message: "New password is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Case 1: Password Reset (unauthenticated, with token)
    if (token && email) {
      const user = await User.findOne({ email, token });
      if (!user || !user.tokenExpiry || new Date() > user.tokenExpiry) {
        return NextResponse.json(
          { message: "Invalid or expired reset link." },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(newPassword, 10);
      user.token = null;
      user.tokenExpiry = null;
      await user.save();

      return NextResponse.redirect(
        new URL("/auth/signin", process.env.NEXTAUTH_URL).toString()
      );
    }

    // Case 2: Password Update (authenticated user)
    if (session) {
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }

      if (
        currentPassword &&
        !(await bcrypt.compare(currentPassword, user.password))
      ) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return NextResponse.json(
        { message: "Password updated successfully." },
        { status: 200 }
      );
    }

    // Unauthorized request if not authenticated and no token provided
    return NextResponse.json(
      { message: "Unauthorized request." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error during password reset/update:", error);
    return NextResponse.json(
      { message: "Password reset/update failed. Please try again." },
      { status: 500 }
    );
  }
}
