// app/api/user/update-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/User";
import { getServerSession } from "next-auth";
import authOptions from "../../../../lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password } = await req.json();
  if (!name || !email) {
    return NextResponse.json(
      { message: "Name and email are required" },
      { status: 400 }
    );
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user?.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Update name and email
  user.name = name;
  user.email = email;

  // If password is provided, hash and update it
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }

  await user.save();

  return NextResponse.json(
    { message: "Profile updated successfully" },
    { status: 200 }
  );
}
