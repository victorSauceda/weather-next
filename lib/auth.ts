import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb'; // MongoDB Client
import bcrypt from 'bcrypt';
import User from '@/models/User'; // Mongoose User model

const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  session: {
    strategy: 'database', // Use MongoDB-backed sessions
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        if (!email || !password) {
          throw new Error('Missing email or password');
        }

        // Connect to MongoDB and find the user by email
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error('No user found with this email');
        }

        // Compare entered password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Return user object (omit sensitive information)
        return { id: user._id.toString(), email: user.email, name: user.name };
      }
    }),
  ],

  pages: {
    signIn: '/signin', // Custom sign-in page
  },

  secret: process.env.SECRET, // For signing tokens
};

export default authOptions;
