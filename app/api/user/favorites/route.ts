'use server';
import {NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoose';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth';
import authOptions from '../../../../lib/auth';

export default async function GET(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session) return NextResponse.json({message: 'unauthorized'}, {status: 401});

  const user = await User.findOne({ email: session.user?.email }).populate('favoriteCities');
  if(!user || !user.favoriteCities) {return NextResponse.json([],{status: 200})}
  
  return NextResponse.json(user.favoriteCities,{status: 200});
}
