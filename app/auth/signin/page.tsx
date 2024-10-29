"use client";

import { getProviders, signIn, ClientSafeProvider } from "next-auth/react";
import { useEffect, useState } from "react";
import SignInForm from "../../components/SignInForm";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [providers, setProviders] = useState<ClientSafeProvider[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      // Filter out the 'Credentials' provider
      const filteredProviders = Object.values(res || {}).filter(
        (provider): provider is ClientSafeProvider =>
          provider.id !== "credentials"
      );
      setProviders(filteredProviders);
    };

    fetchProviders();
  }, []);

  const handleSignIn = (providerId: string) => {
    signIn(providerId, { callbackUrl: "/dashboard" });
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
            Sign in to your account
          </h2>

          {/* Sign In Form for email/password authentication */}
          <SignInForm />

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <button
              onClick={handleForgotPassword}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {`Don't`} have an account?{" "}
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
              {providers.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleSignIn(provider.id)}
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
