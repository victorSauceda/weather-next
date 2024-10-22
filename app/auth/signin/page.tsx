"use client";

import { getProviders, signIn, ClientSafeProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SignInForm from '../../components/SignInForm';

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      console.log('Providers:', res); // Log the providers to check
      setProviders(res);
    };

    fetchProviders();
  }, []);

  const handleSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl: '/dashboard' });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      {providers && Object.values(providers).map((provider) => (
        <button
          key={provider.name}
          onClick={() => handleSignIn(provider.id)} // Use the handler with redirect
          className='p-4 bg-blue-600 text-white rounded-md'
        >
          Sign in with {provider.name}
        </button>
      ))}
      {/* Sign In Form for email/password authentication */}
      <SignInForm />
    </div>
  );
}
