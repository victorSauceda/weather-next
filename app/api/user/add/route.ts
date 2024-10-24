'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User, { IUser } from '../../../../models/User'; // Ensure IUser interface is imported
import City, { ICity } from '../../../../models/City'; // Ensure ICity interface is imported
import { getServerSession } from 'next-auth';
import { City as CityType } from '../../../components/AutocompleteSearch'; // Import CityType from the shared types folder
import authOptions from '../../../../lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("Route hit: POST /api/user/add");

    // Connect to the database
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Connected to database");

    // Parse request body
    console.log("Parsing request body...");
    const body = await req.json();
    const { city }: { city: CityType } = body;
    console.log("Parsed city from request body:", city);

    // Get session
    console.log("Fetching session...");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("No session found, returning 401");
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }
    console.log("Session found:", session);

    // Find the user by email or create a new user if not found
    console.log("Finding user by email...");
    let user: IUser | null = await User.findOne({ email: session.user?.email });
    if (!user) {
      console.log("User not found, creating a new user...");
      user = new User({
        email: session.user?.email,
        name: session.user?.name || '',
        image: session.user?.image || '',
        favoriteCities: [],
      });
      await user?.save();
      console.log("New user created:", user?.email);
    }

    // Since we know the user now exists, ensure TypeScript is aware of that.
    if (!user) {
      throw new Error('User creation failed');
    }

    // Add city to favorites
    console.log("Finding city in the database...");
    let cityRecord: ICity | null = await City.findOne({ id: city.id });
    if (!cityRecord) {
      console.log("City not found, creating new city record...");
      cityRecord = await City.create(city);
      console.log("City record created:", cityRecord);
    } else {
      console.log("City record found:", cityRecord);
    }

    // Check if the city is already in user's favorites
    if (user.favoriteCities.some((favCity) => favCity.id.toString() === cityRecord?.id.toString())) {
      console.log("City is already in user's favorites");
      return NextResponse.json({ message: 'City already in favorites' }, { status: 200 });
    }

    // Add city to user's favorites
    console.log("Adding city to user's favorites...");
    user.favoriteCities.push(cityRecord);
    await user.save();
    console.log("City added to user's favorites");

    // Populate and return the updated list of favorite cities
    await user.populate<{ favoriteCities: ICity[] }>('favoriteCities');
    console.log("Returning updated favorites with city:", user.favoriteCities);

    return NextResponse.json(user.favoriteCities, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in add route:', (error as Error).message, (error as Error).stack);
    return NextResponse.json({ message: 'Server error', details: (error as Error).message }, { status: 500 });
  }
}
