"use server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongoose";
import User, { IUser } from "../../../../models/User";
import City, { ICity } from "../../../../models/City";
import { getServerSession } from "next-auth";
import { City as CityType } from "../../../components/AutocompleteSearch"; // Import City from AutocompleteSearch
import authOptions from "../../../../lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
  await dbConnect();
  const body = await req.json();
  const { city }: { city: CityType } = body;
  console.log(city);
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });

  let user: IUser | null = await User.findOne({ email: session.user?.email });
  if (!user) {
    user = new User({
      email: session.user?.email,
      name: session.user?.name,
      image: session.user?.image ?? '',
      favoriteCities: [],
    });
    await user?.save();
  }
  // Check if user has already added this city
  if (!user) {
    throw new Error("User Creation Failed!");
  }

  // return NextResponse.json({ message: "User Not Found" }, { status: 404 });

  // Add city to favorites
  let cityRecord: ICity | null = await City.findOne({ id: city.id });
  if (!cityRecord) {
    cityRecord = await City.create(city);
  }
  if (
    user.favoriteCities?.some(
      (fcity) => fcity.id.toString() === cityRecord?.id.toString()
    )
  ) {
    return NextResponse.json({ message: "City already added" });
  }
  if (cityRecord && user.favoriteCities) {
    user.favoriteCities.push(cityRecord);
  }
  await user.save();
  await user.populate<{ favoriteCities: ICity[] }>("favoriteCities");
  return NextResponse.json(user.favoriteCities, { status: 200 });
}
