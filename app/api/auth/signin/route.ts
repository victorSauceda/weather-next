'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { signIn } from 'next-auth/react';

export default async function signInRoute(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  await dbConnect();
  const { email, password }: { email: string; password: string } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check if the user's email has been verified
  if (!user.emailVerified) {
    return res.status(403).json({ message: 'Please verify your email before signing in.' });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Proceed to sign in the user using NextAuth credentials
  const result = await signIn('credentials', { redirect: false, email, password });
  if (result?.error) {
    return res.status(401).json({ message: result.error });
  }

  res.status(200).json({ message: 'Sign-in successful!' });
}
