'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import City from '../../../../models/City';
import { getServerSession } from 'next-auth';
import { City as CityType } from '../../../components/AutocompleteSearch'; // Import City from AutocompleteSearch
import authOptions from '../../../../lib/auth';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    console.log("test route");

    // Connect to the database
    await dbConnect();

    // Parse request body
    const body = await req.json();
    const { city }: { city: CityType } = body;
    console.log(city);

    // Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    // Find the user by email
    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      return NextResponse.json({ message: 'User Not Found' }, { status: 404 });
    }

    // Add city to favorites
    let cityRecord = await City.findOne({ id: city.id });
    if (!cityRecord) {
      cityRecord = await City.create(city);
    }
    user.favoriteCities.push(cityRecord._id);
    await user.save();

    return NextResponse.json(user.favoriteCities, { status: 200 });
    
  } catch (error) {
    console.error('Error in addFavorite route:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
