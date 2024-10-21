'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string|null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn('credentials', { redirect: false, email, password });
    if (res?.error) {
      setError('Invalid email or password');
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
