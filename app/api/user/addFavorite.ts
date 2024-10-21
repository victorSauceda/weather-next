'use server';
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import City from '../../../models/City';
import { getSession } from 'next-auth/react';
import { City as CityType } from '../../components/AutocompleteSearch'; // Import City from AutocompleteSearch

export default async function addFavorite(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { city }: { city: CityType } = req.body;
  const session = await getSession({ req });
  if (!session) return res.status(401).send('Unauthorized');

  const user = await User.findOne({ email: session.user?.email });
  if (!user) return res.status(404).send('User not found');

  // Add city to favorites
  let cityRecord = await City.findOne({ id: city.id });
  if (!cityRecord) {
    cityRecord = await City.create(city);
  }
  user.favoriteCities.push(cityRecord._id);
  await user.save();
  res.status(200).json(user.favoriteCities);
}
