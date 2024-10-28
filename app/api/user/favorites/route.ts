"use server";
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongoose";
import User, { IUser } from "../../../../models/User";
import { getServerSession } from "next-auth";
import authOptions from "../../../../lib/auth";
import { ICity } from "../../../../models/City";

export async function GET(): Promise<NextResponse> {
  await dbConnect();
  const session = await getServerSession(authOptions);
  console.log(session);
  if (!session)
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });

  if (session){
    console.log('session.email', session.user?.email);
  }
  const user: IUser | null = await User.findOne({
    email: session.user?.email,
  }).populate<{ favoriteCities: ICity[] }>("favoriteCities");
  if (!user || !user.favoriteCities) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(user.favoriteCities, { status: 200 });
}
