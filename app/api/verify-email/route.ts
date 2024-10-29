// /app/api/auth/verify-email.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import User, { IUser } from "../../../models/User";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  // Ensure token is present
  if (!token) {
    return NextResponse.json(
      { message: "Invalid request. Missing token." },
      { status: 400 }
    );
  }

  try {
    console.log("Connecting to database for email verification...");
    await dbConnect();

    // Find the user based on token and ensure token expiry
    const user: IUser | null = await User.findOne({
      token,
      tokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      console.log(`User with token: ${token} not found or expired.`);
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Check if it is an email update by comparing the new email parameter
    const emailFromRequest = url.searchParams.get("email");
    const isEmailUpdate = emailFromRequest && emailFromRequest !== user.email;

    // Update the user's email if it's an email update
    if (isEmailUpdate) {
      user.email = emailFromRequest!;
    }

    // Mark email as verified, clear token and expiry
    user.emailVerified = true;
    user.token = null;
    user.tokenExpiry = null;
    await user.save();

    // Redirect based on whether it was an email update or signup
    console.log(`User verified successfully. Redirecting to appropriate page.`);
    return NextResponse.redirect(
      new URL(
        isEmailUpdate ? "/auth/signin" : "/dashboard",
        process.env.NEXTAUTH_URL
      ).toString()
    );
  } catch (error) {
    console.error("Error during email verification:", error);
    return NextResponse.json(
      { message: "Email verification failed." },
      { status: 500 }
    );
  }
}
