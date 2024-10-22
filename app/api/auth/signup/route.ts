'use server';

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose'; // Adjust the path if needed
import User, { IUser } from '@/models/User'; // Assuming IUser is an interface for User model
import sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid'; // Import UUID package

// Ensure environment variables are defined
const sendgridApiKey: string = process.env.SENDGRID_API_KEY || '';
if (!sendgridApiKey) {
  throw new Error('SENDGRID_API_KEY is not defined');
}
sgMail.setApiKey(sendgridApiKey);

const fromEmail: string = process.env.EMAIL_FROM || '';
if (!fromEmail) {
  throw new Error('EMAIL_FROM is not defined');
}

const nextAuthUrl: string = process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Use default for local dev

// Helper function to set token expiration time (15 minutes from now)
function getTokenExpiry(minutes: number = 15): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000); // Add minutes to current time
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  await dbConnect();

  const { email }: { email: string } = await req.json(); // Parse request body and type `email` as string

  // Check if the user already exists
  const existingUser: IUser | null = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  // Generate a unique token for the magic link using UUID
  const token: string = uuidv4(); // Generate a UUID v4 token

  // Set the token expiration (e.g., valid for 15 minutes)
  const tokenExpiry: Date = getTokenExpiry(15); // Expiry set to 15 minutes

  // Create a new user object with proper typing
  const newUser: IUser = await User.create({
    email,
    emailVerified: false,
    token,
    tokenExpiry,
  });

  // Create magic link URL (with the generated token)
  const magicLinkUrl: string = `${nextAuthUrl}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(email)}`;

  // Send magic link via SendGrid
  const msg = {
    to: email, // User's email
    from: fromEmail, // Verified SendGrid sender
    subject: 'Your Magic Sign-In Link',
    text: `Click the following link to sign in: ${magicLinkUrl}`,
    html: `<p>Click the following link to sign in: <a href="${magicLinkUrl}">Sign In</a></p>`,
  };

  try {
    await sgMail.send(msg);
    return NextResponse.json({ message: 'User created and magic link sent!' }, { status: 201 });
  } catch (error) {
    console.error('Error sending magic link:', error);
    return NextResponse.json({ message: 'Failed to send magic link' }, { status: 500 });
  }
}
