import NextAuth from 'next-auth';
import authOptions from '../../../../lib/auth'; // Import the authentication options from your custom auth configuration

// Initialize NextAuth with the provided auth options.
// This sets up the NextAuth.js authentication with the custom options
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST requests.
// This allows NextAuth.js to handle authentication requests made to these HTTP methods
export { handler as GET, handler as POST };
