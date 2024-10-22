'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongoose'; // Adjust path if necessary
import User from '@/models/User';

export async function POST(req: NextRequest) {
  await dbConnect();
  
  const { email, password }: { email: string; password: string } = await req.json(); // Parse request body
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const newUser = await User.create({
    email,
    password: hashedPassword,
    emailVerified: false, // Assuming email verification is needed
  });

  // Optionally, you can send a verification email here (implementation not included)

  return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });
}
