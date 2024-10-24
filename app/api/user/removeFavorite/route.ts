'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth';
import authOptions from '../../../../lib/auth';

export async function DELETE(req: NextRequest, res: NextResponse) {
  await dbConnect();
  const body = await req.json()
  const { cityId }: { cityId: number } = body;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({message: 'unauthorized'}, {status: 401});

  const user = await User.findOne({ email: session.user?.email });
  if (!user) return NextResponse.json({message: 'User Not Found'},{status: 404})

  // Remove city from favorites
  user.favoriteCities = user.favoriteCities.filter((fav: number) => fav.toString() !== cityId.toString());
  await user.save();
  return NextResponse.json(user.favoriteCities, {status: 200});
}
