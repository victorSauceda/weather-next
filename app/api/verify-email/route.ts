"use server";

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import User, { IUser } from "../../../models/User";

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Parse the URL to get query parameters
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

    // Find the user with the provided email and magic token
    console.log(email, token);
    const user: IUser | null = await User.findOne({ email, token });
    const currentTime = new Date();
    console.log("current time", currentTime, user);
    if (user && user?.tokenExpiry) {
      console.log("tokenExpiry", user?.tokenExpiry);
    }
    if (user && user?.tokenExpiry && currentTime > user.tokenExpiry) {
      return NextResponse.json(
        { message: "Magic link has expired." },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired magic link." },
        { status: 400 }
      );
    }
    // Update the user's email verification status
    user.emailVerified = true;
    user.token = null; // Clear the magic token after successful verification
    user.tokenExpiry = null;

    await user.save();

    console.log(`User ${email} verified successfully.`);

    // Redirect to the dashboard after successful verification
    return NextResponse.redirect(
      new URL("/dashboard", process.env.NEXTAUTH_URL).toString()
    );
  } catch (error) {
    console.error("Error during email verification:", error);
    return NextResponse.json(
      { message: "Email verification failed. Please try again." },
      { status: 500 }
    );
  }
}
