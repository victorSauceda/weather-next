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
    let user = await User.findOne({ email: session.user?.email });
    if (!user) {
      console.log("User not found, creating a new user...");
      user = new User({
        email: session.user?.email,
        favoriteCities: [],
      });
      await user.save();
      console.log("New user created:", user.email);
    } else {
      console.log("User found:", user.email);
    }

    // Add city to favorites
    console.log("Finding city in the database...");
    let cityRecord = await City.findOne({ id: city.id });
    if (!cityRecord) {
      console.log("City not found, creating new city record...");
      cityRecord = await City.create(city);
      console.log("City record created:", cityRecord);
    } else {
      console.log("City record found:", cityRecord);
    }

    console.log("Adding city to user's favorites...");
    user.favoriteCities.push(cityRecord._id);
    await user.save();
    console.log("City added to user's favorites");

    console.log("Returning response with user's favorite cities");
    return NextResponse.json(user.favoriteCities, { status: 200 });
    
  } catch (error: unknown) {
    console.error('Error in add route:', (error as Error).message, (error as Error).stack);
    return NextResponse.json({ message: 'Server error', details: (error as Error).message }, { status: 500 });
  }
}
