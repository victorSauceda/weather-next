import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from '@/models/User'; // Mongoose User model

// Extend the Session and User types to include 'id'
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;  // Add 'id' field to the session user
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id: string; // Add 'id' field to the JWT
  }
}

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt', // Use JWT for session storage
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

  secret: process.env.NEXTAUTH_SECRET, // For signing tokens
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string; // Ensure token.id is set as string
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;  // Ensure session.user.id is set as string
      }
      return session;
    }
  }
};

export default authOptions;
