'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User, { IUser } from '@/models/User'; // Assuming IUser is your user model interface
import sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid'; // UUID for token generation

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

const nextAuthUrl: string = process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Default for local development

// Helper function to calculate token expiration time (15 minutes from now)
function getTokenExpiry(minutes: number = 15): Date {
  const now = new Date();
  return new Date(now.getTime() + minutes * 60000); // Add minutes to the current time
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log('Connecting to the database...');
    await dbConnect(); // Ensure DB connection

    // Parse the request body and get email and password
    const { email, password }: { email: string; password: string } = await req.json();
    console.log('Received email:', email);

    // Check if the user already exists
    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Generate a unique token for email verification
    const token: string = uuidv4(); // UUID for the token
    const tokenExpiry: Date = getTokenExpiry(15); // Token valid for 15 minutes
    console.log('Generated token:', token);

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for bcrypt
    console.log('Password hashed successfully');

    // Create the new user in the database
    const newUser: IUser = await User.create({
      email,
      password: hashedPassword, // Save hashed password
      emailVerified: false,
      token, // Store token for verification
      tokenExpiry, // Store token expiry
    });
    console.log('User created successfully:', newUser);

    // Create the email verification link
    const magicLinkUrl: string = `${nextAuthUrl}/api/callback/email?token=${token}&email=${encodeURIComponent(email)}`;
    console.log('Magic link URL:', magicLinkUrl);

    // Set up the email message
    const msg = {
      to: email, // The user's email
      from: fromEmail, // Verified SendGrid sender email
      subject: 'Verify your email to complete registration',
      text: `Click the following link to verify your email: ${magicLinkUrl}`,
      html: `<p>Click the following link to verify your email: <a href="${magicLinkUrl}">Verify Email</a></p>`,
    };

    // Try to send the verification email
    await sgMail.send(msg);
    console.log('Verification email sent successfully');
    return NextResponse.json({ message: 'User created and verification email sent!' }, { status: 201 });
  } catch (error: any) {
    console.error('Error during signup process:', error.message);
    return NextResponse.json({ message: `Signup failed: ${error.message}` }, { status: 500 });
  }
}
