'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import { getSession } from 'next-auth/react';

export default async function removeFavorite(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { cityId }: { cityId: number } = req.body;
  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const user = await User.findOne({ email: session.user?.email });
  if (!user) return res.status(404).send('User not found');

  // Remove city from favorites
  user.favoriteCities = user.favoriteCities.filter((fav: number) => fav.toString() !== cityId.toString());
  await user.save();
  res.status(200).json(user.favoriteCities);
}
