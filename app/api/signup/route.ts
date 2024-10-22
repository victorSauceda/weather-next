'use server';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt'; // Import bcrypt for password hashing
import dbConnect from '@/lib/mongoose'; // Adjust the path if needed
import User, { IUser } from '@/models/User'; // Assuming IUser is an interface for User model

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();

    // Parse request body and extract email and password
    const { email, password }: { email: string; password: string } = await req.json();

    console.log('Received signup request for:', email);

    // Check if the user already exists
    const existingUser: IUser | null = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds for bcrypt

    // Create a new user object with proper typing
    const newUser: IUser = await User.create({
      email,
      password: hashedPassword, // Save the hashed password
      emailVerified: false,
    });

    console.log('New user created:', newUser);

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error) {
    console.error('Error occurred during signup:', error);
    return NextResponse.json({ message: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
