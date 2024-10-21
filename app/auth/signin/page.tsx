import { getProviders, signIn, ClientSafeProvider } from 'next-auth/react';
import SignInForm from '../../components/SignInForm';
import { GetServerSideProps } from 'next';

interface SignInProps {
  providers: Record<string, ClientSafeProvider>;
}

export default function SignIn({ providers }: SignInProps) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      {Object.values(providers).map((provider) => (
        <button key={provider.name} onClick={() => signIn(provider.id)} className='p-4 bg-blue-600 text-white rounded-md'>
          Sign in with {provider.name}
        </button>
      ))}
      {/* Sign In Form for email/password authentication */}
      <SignInForm />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return { props: { providers } };
};
