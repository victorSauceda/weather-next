'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
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

  // Parse request body and extract email and password
  const { email, password }: { email: string; password: string } = await req.json();

  // Check if the user already exists
  const existingUser: IUser | null = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }

  // Generate a unique token for the magic link using UUID
  const token: string = uuidv4(); // Generate a UUID v4 token

  // Set the token expiration (e.g., valid for 15 minutes)
  const tokenExpiry: Date = getTokenExpiry(15); // Expiry set to 15 minutes

  // Hash the password before saving the user
  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for bcrypt

  // Create a new user object with proper typing
  const newUser: IUser = await User.create({
    email,
    password: hashedPassword, // Save the hashed password
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
    subject: 'Verify your email to complete registration',
    text: `Click the following link to verify your email: ${magicLinkUrl}`,
    html: `<p>Click the following link to verify your email: <a href="${magicLinkUrl}">Verify Email</a></p>`,
  };

  try {
    await sgMail.send(msg);
    return NextResponse.json({ message: 'User created and verification email sent!' }, { status: 201 });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ message: 'Failed to send verification email' }, { status: 500 });
  }
}
