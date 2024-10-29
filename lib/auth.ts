import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "../lib/mongoose";
import User from "../models/User";
import GoogleProvider from "next-auth/providers/google";

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await dbConnect();

        // Find the user with the provided email
        const user = await User.findOne({ email: credentials?.email });
        if (!user) return null; // Return null if no user is found

        // Check if the user's email has been verified
        if (!user.emailVerified) {
          console.log("User's email is not verified.");
          return null; // Deny access if email is not verified
        }

        // Verify the password against the hashed password in the database
        const isValid = await bcrypt.compare(
          credentials?.password || "",
          user.password
        );
        if (!isValid) return null; // Deny access if password is incorrect

        // Return user object if credentials are valid and email is verified
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? "",
          image: user.image ?? "",
        };
      },
    }),
  ],
  // Custom authentication pages

  pages: {
    signIn: "/auth/signin", // Custom sign-in page route
  },
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  // Secret for signing JWT and encrypting tokens
  secret: process.env.NEXT_AUTH_SECRET,
};

export default authOptions;
