'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInForm() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Use NextAuth's signIn function to authenticate with credentials
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password
    });

    if (res?.error) {
      // Show error message if authentication failed
      setError('Invalid email or password');
    } else {
      // Redirect to dashboard after successful sign-in
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-sm mt-8'>
      <input
        type='email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Email'
        required
        className='mb-4 p-2 w-full border rounded-md'
      />
      <input
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Password'
        required
        className='mb-4 p-2 w-full border rounded-md'
      />
      {error && <p className='text-red-500 mb-4'>{error}</p>}
      <button type='submit' className='w-full p-2 bg-blue-600 text-white rounded-md'>
        Sign In
      </button>
    </form>
  );
}
