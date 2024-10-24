'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User'; // Ensure correct import of User model
import City from '../../../../models/City'; // Ensure City model is registered correctly
import { getServerSession } from 'next-auth';
import authOptions from '../../../../lib/auth';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    console.log("GET /api/user/favorites route hit");

    // Connect to the database
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected successfully.");

    // Fetch the user session
    console.log("Fetching session...");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("No session found, returning 401 Unauthorized.");
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }
    console.log(`Session found for user: ${session.user?.email}`);

    // Find the user by email and populate the favorite cities
    console.log("Finding user and populating favorite cities...");
    const user = await User.findOne({ email: session.user?.email }).populate('favoriteCities');
    if (!user || !user.favoriteCities) {
      console.log("No user or favorite cities found, returning empty array.");
      return NextResponse.json([], { status: 200 });
    }

    // Log the populated favorite cities
    console.log("Favorite cities found:", user.favoriteCities);

    // Return the favorite cities in the response
    return NextResponse.json(user.favoriteCities, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in GET /api/user/favorites route:', (error as Error).message, (error as Error).stack);
    return NextResponse.json({ message: 'Server error', details: (error as Error).message }, { status: 500 });
  }
}
