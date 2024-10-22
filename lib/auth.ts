import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb'; // MongoDB Client
import bcrypt from 'bcrypt';
import User from '@/models/User'; // Mongoose User model

const authOptions: NextAuthOptions = {
  // MongoDB Adapter for session storage
  adapter: MongoDBAdapter(clientPromise),

  // Session management configuration
  session: {
    strategy: 'database', // Keep this if you're using MongoDB to store sessions in the database
  },

  // Authentication providers (in this case, credentials provider)
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Destructure email and password from credentials
        const { email, password } = credentials ?? {};

        // Check for missing email or password
        if (!email || !password) {
          throw new Error('Both email and password are required');
        }

        // Find the user by email in MongoDB
        const user = await User.findOne({ email });

        // If no user found, throw an error
        if (!user) {
          throw new Error('No user found with this email');
        }

        // Verify the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // If everything is correct, return the user object (omitting sensitive information)
        return { id: user._id.toString(), email: user.email, name: user.name };
      }
    }),
  ],

  // Custom pages for authentication flows
  pages: {
    signIn: '/signin', // Custom sign-in page route
  },

  // Secret for signing tokens, required for session management
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in your .env
};

export default authOptions;
