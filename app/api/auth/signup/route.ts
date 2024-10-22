'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongoose'; // Adjust the path if needed
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, password }: { email: string; password: string } = await req.json(); // Parse request body

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    emailVerified: false, // Assuming email verification is required
  });

  // Optionally, you can trigger an email verification process here

  return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });
}
