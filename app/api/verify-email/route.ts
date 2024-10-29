// /app/api/auth/verify-email.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import User, { IUser } from "../../../models/User";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  let email = url.searchParams.get("email");

  // Ensure token and email are present
  if (!token || !email) {
    return NextResponse.json(
      { message: "Invalid request. Missing token or email." },
      { status: 400 }
    );
  }

  email = email.replace(/ /g, "+");

  try {
    await dbConnect();

    // Find the user based on token and email
    const user: IUser | null = await User.findOne({
      email,
      token,
      tokenExpiry: { $gt: new Date() }, // Ensure token is not expired
    });

    if (!user) {
      console.log(
        `User with email: ${email} and token: ${token} not found or expired.`
      );
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 400 }
      );
    }

    const isEmailUpdate = user.email !== email;
    user.emailVerified = true;

    if (isEmailUpdate) {
      user.email = email;
      user.token = null;
      user.tokenExpiry = null;
      await user.save();

      // Redirect for an email update
      return NextResponse.redirect(
        new URL("/auth/signin", process.env.NEXTAUTH_URL).toString()
      );
    } else {
      // For a new signup, verify email and clear token
      user.token = null;
      user.tokenExpiry = null;
      await user.save();

      // Redirect to the dashboard after successful signup
      return NextResponse.redirect(
        new URL("/dashboard", process.env.NEXTAUTH_URL).toString()
      );
    }
  } catch (error) {
    console.error("Error during email verification:", error);
    return NextResponse.json(
      { message: "Email verification failed." },
      { status: 500 }
    );
  }
}
