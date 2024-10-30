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
    // Fetch the session
    const session = await getServerSession(authOptions);

    // Check if there’s an authenticated session
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized request." },
        { status: 401 }
      );
    }

    const { email } = session.user; // Get email from session
    console.log("Authenticated user email:", email);

    // Parse the body for the new and current passwords
    const { newPassword, currentPassword } = await req.json();

    if (!newPassword || !currentPassword) {
      return NextResponse.json(
        { message: "New password and current password are required." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // Check if the current password is correct
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Hash the new password and update the user record
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during password update:", error);
    return NextResponse.json(
      { message: "Password update failed. Please try again." },
      { status: 500 }
    );
  }
}
