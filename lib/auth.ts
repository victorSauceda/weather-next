import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb'; // Use the MongoClient, not Mongoose

const authOptions: NextAuthOptions = {
  // Use MongoDB Adapter for session storage
  adapter: MongoDBAdapter(clientPromise),

  // Use server-side sessions (database-backed sessions)
  session: {
    strategy: 'database', // Use server-side sessions stored in the database
  },

  // Google OAuth provider
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  // Redirect to custom sign-in page
  pages: {
    signIn: '/signin',
  },

  // Secret for encrypting tokens and signing cookies (required)
  secret: process.env.SECRET,
};

export default authOptions;
