'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User, { IUser } from '../../../../models/User'; // Import the User model and IUser interface
import City, { ICity } from '../../../../models/City'; // Import the City model and ICity interface
import { getServerSession } from 'next-auth';
import authOptions from '../../../../lib/auth'; // Import authentication options for session management

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Establish a connection to the MongoDB database
    await dbConnect();

    // Parse the request body to extract the city ID to be removed
    const body = await req.json();
    const { cityId }: { cityId: number } = body;

    // Retrieve the user session using NextAuth
    const session = await getServerSession(authOptions);
    if (!session) {
      // If no session is found, return a 401 Unauthorized response indicating the user is not authenticated
      return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
    }

    // Find the user by their email and populate the 'favoriteCities' field with full city objects
    const user: IUser | null = await User.findOne({ email: session.user?.email }).populate<{ favoriteCities: ICity[] }>('favoriteCities');

    // If the user is not found, return a 404 Not Found response
    if (!user) {
      return NextResponse.json({ message: 'User Not Found' }, { status: 404 });
    }

    // Remove the city from the user's list of favorite cities by filtering out the city with the matching ID
    user.favoriteCities = user.favoriteCities.filter((favCity: ICity) => favCity.id !== cityId);

    // Save the updated user document after the city has been removed
    await user.save();

    // Return the updated list of favorite cities after the removal
    return NextResponse.json(user.favoriteCities, { status: 200 });

  } catch (error: unknown) {
    // Handle any errors that occur during the process and return a 500 status with the error details
    return NextResponse.json({ message: 'Server error', details: (error as Error).message }, { status: 500 });
  }
}
