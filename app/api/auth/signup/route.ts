'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';

export default async function signUp(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new User({ email, password: hashedPassword });
  await newUser.save();
  res.status(201).json({ message: 'User created successfully' });
}
