import { getProviders, signIn, ClientSafeProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';
import SignInForm from '../../components/SignInForm';

interface SignInProps {
  providers: Record<string, ClientSafeProvider>;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    fetchProviders();
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      {providers && Object.values(providers).map((provider) => (
        <button key={provider.name} onClick={() => signIn(provider.id)} className='p-4 bg-blue-600 text-white rounded-md'>
          Sign in with {provider.name}
        </button>
      ))}
      {/* Sign In Form for email/password authentication */}
      <SignInForm />
    </div>
  );
}
