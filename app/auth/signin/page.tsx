"use client";
import { getProviders, signIn, ClientSafeProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface SignInProps {
  providers: Record<string, ClientSafeProvider> | null;
}

export default function SignIn() {
  const [providers, setProviders] = useState<SignInProps['providers']>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  if (!providers) return <p>Loading...</p>;

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      {Object.values(providers).map((provider) => (
        <button key={provider.name} onClick={() => signIn(provider.id)} className='p-4 bg-blue-600 text-white rounded-md'>
          Sign in with {provider.name}
        </button>
      ))}
    </div>
  );
}
