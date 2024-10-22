'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // For programmatic navigation

export default function SignUp() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean>(false); // Track if email was sent
  const router = useRouter(); // Hook for navigation

  // Function to handle sign-up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      // Check if passwords match
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        // Show the email sent message for 3 seconds
        setEmailSent(true);
        setTimeout(() => {
          // Redirect to login after 3 seconds
          router.push('/signin');
        }, 3000); // 3-second delay
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to sign up. Please try again.');
    }
  };

  if (emailSent) {
    // Show success message when email is sent
    return (
      <div className='min-h-screen text-black flex flex-col items-center justify-center bg-gray-100'>
        <h1 className='text-4xl mb-6'>Sign Up</h1>
        <p className='text-green-500 mb-6'>
          An email was sent to the email you provided. Redirecting to login...
        </p>
      </div>
    );
  }

  return (
    <div className='min-h-screen text-black flex flex-col items-center justify-center bg-gray-100'>
      <h1 className='text-4xl mb-6'>Sign Up</h1>
      <form onSubmit={handleSignUp} className='w-full max-w-sm'>
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
        <input
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm Password'
          required
          className='mb-4 p-2 w-full border rounded-md'
        />
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        <button type='submit' className='w-full p-2 bg-blue-600 text-white rounded-md'>
          Sign Up
        </button>
      </form>
      <p className='mt-4'>Already have an account?</p>
      <a href='/signin' className='text-blue-500 hover:underline'>
        Sign In
      </a>
    </div>
  );
}
