import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";
import { getServerSession } from "next-auth";
import authOptions from "../../../lib/auth"; // Adjust the path to your auth config
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.json(
      { message: "Invalid request. Missing token or email." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(new URL(`/auth/reset-password?email=${email}&token=${token}`, process.env.NEXTAUTH_URL).toString());
}
export async function POST(req: NextRequest) {
  try {
    console.log("Starting password reset process...");

    // Parse request body for newPassword and token/email
    const { newPassword, token } = await req.json();

    if (!newPassword) {
      return NextResponse.json(
        { message: "New password is required." },
        { status: 400 }
      );
    }

    await dbConnect();

    if (token) {
      // Unauthenticated Forgot Password Flow
      console.log("Handling forgot password reset using token...");
      const user = await User.findOne({ token });

      if (!user || !user.tokenExpiry || new Date() > user.tokenExpiry) {
        console.log("Invalid or expired reset link.");
        return NextResponse.json(
          { message: "Invalid or expired reset link." },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.token = null;
      user.tokenExpiry = null;
      await user.save();

      console.log(`Password reset successful for user: ${user.email}`);
      return NextResponse.json({ message: "Password reset successful" });
    } else {
      // Authenticated Profile Password Reset Flow
      const session = await getServerSession(authOptions);

      if (!session || !session.user?.email) {
        return NextResponse.json(
          { message: "Unauthorized request." },
          { status: 401 }
        );
      }

      console.log("Handling profile password update for authenticated user...");
      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      console.log(`Password updated successfully for user: ${session.user.email}`);
      return NextResponse.json({ message: "Password updated successfully" });
    }
  } catch (error) {
    console.error("Error during password reset/update:", error);
    return NextResponse.json(
      { message: "Password reset/update failed. Please try again." },
      { status: 500 }
    );
  }
}
