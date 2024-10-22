'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongoose'; // Adjust the path as necessary
import User from '@/models/User';
import { signIn } from 'next-auth/react';

export async function POST(req: NextRequest) {
  await dbConnect();

  const { email, password }: { email: string; password: string } = await req.json(); // Parse the request body

  // Check if the user exists
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  // Check if the user's email has been verified
  if (!user.emailVerified) {
    return NextResponse.json({ message: 'Please verify your email before signing in.' }, { status: 403 });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
  }

  // Proceed to sign in the user using NextAuth credentials
  const result = await signIn('credentials', { redirect: false, email, password });
  if (result?.error) {
    return NextResponse.json({ message: result.error }, { status: 401 });
  }

  // Successful sign-in
  return NextResponse.json({ message: 'Sign-in successful!' }, { status: 200 });
}
