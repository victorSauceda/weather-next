"use client";

import { getProviders, signIn, ClientSafeProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SignInForm from '../../components/SignInForm';
import { useRouter } from 'next/router'; // Import router for navigation

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const router = useRouter(); // Initialize Next.js router

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  const handleSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl: '/dashboard' });
  };

  const handleSignUp = () => {
    router.push('/auth/signup'); // Redirect to sign-up page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">Sign in to your account</h2>
          {/* Sign In Form for email/password authentication */}
          <SignInForm />

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={handleSignUp}
                className="text-blue-600 hover:underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>

        {/* OAuth providers */}
        {providers && (
          <div className="mt-6">
            <div className="flex flex-col space-y-4">
              {Object.values(providers).map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleSignIn(provider.id)} // Use the handler with redirect
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign in with {provider.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
