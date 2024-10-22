'use server';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await dbConnect();

  // Extract token and email from the URL query parameters
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token || !email) {
    return NextResponse.json({ message: 'Invalid or missing token/email' }, { status: 400 });
  }

  // Find the user with the matching email and token
  const user = await User.findOne({ email, token });

  if (!user) {
    return NextResponse.json({ message: 'Invalid token or email' }, { status: 400 });
  }

  // Check if the token has expired
  if (user.tokenExpiry < new Date()) {
    return NextResponse.json({ message: 'Token has expired' }, { status: 400 });
  }

  // Mark the user's email as verified, clear the token and token expiry
  user.emailVerified = true;
  user.token = null;
  user.tokenExpiry = null;
  await user.save();

  // Redirect the user to the dashboard after successful verification
  return NextResponse.redirect('/dashboard');
}
