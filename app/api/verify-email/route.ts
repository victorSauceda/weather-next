// /app/api/auth/verify-email.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import User, { IUser } from "../../../models/User";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  let email = url.searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { message: "Invalid request. Missing token or email." },
      { status: 400 }
    );
  }
  email = email.replace(/ /g, "+");

  try {
    await dbConnect();

    const user: IUser | null = await User.findOne({
      token,
      tokenExpiry: { $gt: new Date() },
    });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 }
      );
    }

    // Determine if it's a new signup or email update
    const isEmailUpdate = user.email !== email;

    if (isEmailUpdate) {
      user.email = email;
      user.emailVerified = true;
      await user.save();

      // Redirect to the sign-in page for email update
      return NextResponse.redirect(
        new URL("/auth/signin", process.env.NEXTAUTH_URL).toString()
      );
    }

    // For new signup, verify the email and redirect to dashboard
    user.emailVerified = true;
    user.token = null;
    user.tokenExpiry = null;
    await user.save();

    return NextResponse.redirect(
      new URL("/dashboard", process.env.NEXTAUTH_URL).toString()
    );
  } catch (error) {
    console.error("Error during email verification:", error);
    return NextResponse.json(
      { message: "Email verification failed." },
      { status: 500 }
    );
  }
}
