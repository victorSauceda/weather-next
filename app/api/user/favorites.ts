'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import { getSession } from 'next-auth/react';

export default async function getFavorites(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const user = await User.findOne({ email: session.user?.email }).populate('favoriteCities');
  if (!user) return res.status(404).send('User not found');

  res.status(200).json(user.favoriteCities);
}
