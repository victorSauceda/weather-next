// app/api/reset-password.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";

export async function GET(req: NextRequest) {
  // Parse the query parameters (for the initial page load when clicking the link)
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { message: "Invalid request. Missing token or email." },
      { status: 400 }
    );
  }

  // Return a response indicating the reset page can load
  return NextResponse.redirect(new URL(`/auth/reset-password?email=${email}&token=${token}`, process.env.NEXTAUTH_URL).toString());
}




export async function POST(req: NextRequest) {
  try {
    console.log("Starting password reset process...");

    // Parse the body from the request
    const body = await req.json();
    const { newPassword, token, email } = body;
    console.log("Received data:", { newPassword, token, email });

    

    // Check if all required fields are provided
    if (!newPassword || !token || !email) {
      console.log("Missing required fields:", { newPassword, token, email });
      return NextResponse.json(
        { message: "New password, token, and email are required." },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected.");

    // Find the user by email and token
    console.log("Searching for user with provided email and token...");
    const user = await User.findOne({ token });
    console.log("User search result:", user);

    // Check if the user exists and if the token is still valid
    if (!user) {
      console.log("User not found or token mismatch.");
      return NextResponse.json(
        { message: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    if (!user.tokenExpiry || new Date() > user.tokenExpiry) {
      console.log("Token expired:", user.tokenExpiry);
      return NextResponse.json(
        { message: "Token has expired." },
        { status: 400 }
      );
    }

    // Hash the new password and update the user record
    console.log("Hashing new password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log("Updating user password...");
    user.password = hashedPassword;
    user.token = null;
    user.tokenExpiry = null;
    await user.save();

    console.log(`Password reset successful for user: ${email}`);

 return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error during password reset:", error);
    return NextResponse.json(
      { message: "Password reset failed. Please try again." },
      { status: 500 }
    );
  }
}
