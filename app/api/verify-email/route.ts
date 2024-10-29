// /app/api/auth/verify-email.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import User, { IUser } from "../../../models/User";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { message: "Invalid request. Missing token." },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // Find the user based solely on token
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

    // Check if it is an email update
    const isEmailUpdate = url.searchParams.get("email") !== user.email;

    if (isEmailUpdate) {
      // Update email if different
      user.email = url.searchParams.get("email")!;
    }

    // Mark email as verified, clear token and expiry
    user.emailVerified = true;
    user.token = null;
    user.tokenExpiry = null;
    await user.save();

    // Redirect based on whether it was an email update or signup
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
