'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import dbConnect from '../../../lib/mongoose'; // Adjust the path if needed
import User, { IUser } from '../../../models/User'; // Assuming IUser is an interface for User model
import { v4 as uuidv4 } from 'uuid';
import sendgrid from "@sendgrid/mail" // Adjust the path if needed
sendgrid.setApiKey(process.env.SENDGRID_API_KEY || ''); // Set your SendGrid API key

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Connect to the database
    await dbConnect();
    console.log('Database connected');

    // Step 2: Parse request body
    const { name, email, password }: { name: string; email: string; password: string } = await req.json();
    console.log('Received signup request for email:', email);

    // Step 3: Check if the user already exists (through OAuth or regular signup)
    const existingUser: IUser | null = await User.findOne({ email });

    if (existingUser) {
      console.log('User already exists:', email);

      // If the user exists but has no password (e.g., they signed up via OAuth), allow setting a password
      if (!existingUser.password) {
        console.log('User exists through OAuth, updating with new password...');

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        existingUser.password = hashedPassword; // Set the password
        await existingUser.save(); // Save the updated user

        return NextResponse.json({ message: 'Password set successfully!' }, { status: 200 });
      }

      // If the user already has a password, return an error indicating that the user exists
      return NextResponse.json({ message: 'User already exists with a password' }, { status: 400 });
    }

    // Step 4: Hash the password for a new user
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    const magicToken = uuidv4();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 10);

    // Step 5: Create a new user
    const newUser: IUser = await User.create({
      email,
      name,
      password: hashedPassword, // Save the hashed password
      emailVerified: false,
      token: magicToken,
      tokenExpiry: expiry,
    });
    console.log('New user created:', newUser);
    const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${magicToken}&email=${email}`
    const message = {to: email, from: process.env.EMAIL_FROM as string, subject: 'Verify your email', html: `<p>Click <a href="${verificationLink}">here</a> to verify your email and complete your registration.</p>`}
    await sendgrid.send(message)
    console.log('verification email sent to', email)

    // Step 6: Send success response
    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error occurred during signup:', err.message);
      console.error(err.stack);
    } else {
      console.error('Unknown error occurred during signup:', err);
    }

    // Return a generic error response
    return NextResponse.json({ message: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
