// /app/api/auth/signup.ts
"use server";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../lib/mongoose";
import User, { IUser } from "../../../models/User";
import { v4 as uuidv4 } from "uuid";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const {
      id = "",
      name,
      email,
      password,
      isEmailUpdate = false,
    }: {
      id?: string;
      name: string;
      email: string;
      password?: string;
      isEmailUpdate?: boolean;
    } = await req.json();

    // Handle email change for an existing user
    if (isEmailUpdate) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { message: "Email is already in use." },
          { status: 400 }
        );
      }

      const updateToken = uuidv4();
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 10);

      await User.findOneAndUpdate(
        { _id: id },
        { token: updateToken, tokenExpiry: expiry }
      );
      const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${updateToken}&email=${email}`;

      await sendgrid.send({
        to: email,
        from: process.env.EMAIL_FROM as string,
        subject: "Confirm your new email address",
        html: `<p>Please confirm your new email by clicking <a href="${verificationLink}">here</a>.</p>`,
      });

      return NextResponse.json({ message: "Verification email sent." });
    }

    // New signup
    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser && !existingUser.password) {
      const hashedPassword = await bcrypt.hash(password!, 10);
      existingUser.password = hashedPassword;
      await existingUser.save();
      return NextResponse.json(
        { message: "Password set successfully!" },
        { status: 200 }
      );
    }

    const hashedPassword = await bcrypt.hash(password!, 10);
    const newUser: IUser = await User.create({
      email,
      name,
      password: hashedPassword,
      emailVerified: false,
      token: uuidv4(),
      tokenExpiry: new Date(Date.now() + 3600000), // 1 hour expiry
    });

    const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${newUser.token}&email=${email}`;
    await sendgrid.send({
      to: email,
      from: process.env.EMAIL_FROM as string,
      subject: "Verify your email",
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });

    return NextResponse.json(
      { message: "User created successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { message: "Signup failed. Please try again." },
      { status: 500 }
    );
  }
}
