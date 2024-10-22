'use server';

import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import dbConnect from '@/lib/mongoose'; // Adjust the path if needed
import User, { IUser } from '@/models/User'; // Assuming IUser is an interface for User model

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Connect to the database
    await dbConnect();
    console.log('Database connected');

    // Step 2: Parse request body
    const { email, password }: { email: string; password: string } = await req.json();
    console.log('Received signup request for email:', email);

    // Step 3: Check if the user already exists
    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Step 4: Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Step 5: Create a new user
    const newUser: IUser = await User.create({
      email,
      password: hashedPassword, // Save the hashed password
      emailVerified: false,
    });
    console.log('New user created:', newUser);

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
