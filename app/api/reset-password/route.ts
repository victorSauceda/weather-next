"use server";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse the URL to get query parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    let email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { message: "Invalid request. Missing token or email." },
        { status: 400 }
      );
    }
    email = email.replace(/ /g, "+");

    // Parse the request body for the new password
    const { newPassword } = await req.json();
    if (!newPassword) {
      return NextResponse.json(
        { message: "New password is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user with the provided email and reset token
    const user = await User.findOne({ email, token });
    const currentTime = new Date();

    // Check if user and token exist, and if the token has expired
    if (!user || !user.tokenExpiry || currentTime > user.tokenExpiry) {
      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the token fields
    user.password = hashedPassword;
    user.token = null;
    user.tokenExpiry = null;
    await user.save();

    console.log(`Password reset successful for user: ${email}`);

    // Redirect to the sign-in page after successful reset
    return NextResponse.redirect(
      new URL("/auth/signin", process.env.NEXTAUTH_URL).toString()
    );
  } catch (error) {
    console.error("Error during password reset:", error);
    return NextResponse.json(
      { message: "Password reset failed. Please try again." },
      { status: 500 }
    );
  }
}
