'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth';
import authOptions from '../../../../lib/auth';

export async function DELETE(req: NextRequest, res: NextResponse): Promise<NextResponse> {
  try {
    console.log("DELETE /api/user/removeFavorite route hit");

    // Connect to the database
    console.log("Connecting to database...");
    await dbConnect();
    console.log("Database connected successfully.");

    // Parse request body
    console.log("Parsing request body...");
    const body = await req.json();
    const { cityId }: { cityId: number } = body;
    console.log(`City ID to remove: ${cityId}`);

    // Fetch session
    console.log("Fetching session...");
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log("No session found, returning 401 Unauthorized.");
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }
    console.log(`Session found for user: ${session.user?.email}`);

    // Find user by email
    console.log("Finding user by email...");
    const user = await User.findOne({ email: session.user?.email });
    if (!user) {
      console.log("User not found, returning 404.");
      return NextResponse.json({ message: 'User Not Found' }, { status: 404 });
    }
    console.log(`User found: ${user.email}`);

    // Remove city from user's favorites
    console.log(`Attempting to remove city with ID: ${cityId} from user's favorites.`);
    user.favoriteCities = user.favoriteCities.filter((fav: number) => fav.toString() !== cityId.toString());
    await user.save();
    console.log("City removed from user's favorites and user saved.");

    // Return updated favorite cities
    console.log("Returning updated list of favorite cities.");
    return NextResponse.json(user.favoriteCities, { status: 200 });

  } catch (error: unknown) {
    console.error('Error in DELETE /api/user/removeFavorite:', (error as Error).message, (error as Error).stack);
    return NextResponse.json({ message: 'Server error', details: (error as Error).message }, { status: 500 });
  }
}
