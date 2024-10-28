'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // For programmatic navigation

export default function SignUp() {
  const [name, setName] = useState<string>(''); // State to hold user's name
  const [email, setEmail] = useState<string>(''); // State to hold user's email
  const [password, setPassword] = useState<string>(''); // State to hold password
  const [confirmPassword, setConfirmPassword] = useState<string>(''); // State to hold confirmation password
  const [error, setError] = useState<string | null>(null); // State to manage any errors
  const [emailSent, setEmailSent] = useState<boolean>(false); // Track if email was sent
  const router = useRouter(); // Hook for navigation

  // Function to handle sign-up form submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (password !== confirmPassword) {
      // Check if passwords match
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Submitting signup request:', { name, email, password });
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }), // Send name, email, and password to the API
      });

      if (res.ok) {
        // Show the email sent message for 3 seconds
        console.log('Signup successful, redirecting...');
        setEmailSent(true);
        setTimeout(() => {
          // Redirect to login after 3 seconds
          router.push('/auth/signin');
        }, 3000); // 3-second delay
      } else {
        // Fetch the error message and display it
        const data = await res.json();
        if (data.message === 'User already exists') {
          setError('User already exists. Please sign in.'); // Display user exists error
        } else {
          setError(data.message || 'Failed to sign up. Please try again.');
        }
      }
    } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Unexpected error during signup:', err.message); // Log the error message
          setError('Failed to sign up. Please try again.');
        } else {
          console.error('An unexpected error occurred.');
          setError('Failed to sign up. Please try again.');
        }
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
        {/* Input field for name */}
        <input
          type='text'
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder='Name'
          required
          className='mb-4 p-2 w-full border rounded-md'
        />
        {/* Input field for email */}
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Email'
          required
          className='mb-4 p-2 w-full border rounded-md'
        />
        {/* Input field for password */}
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Password'
          required
          className='mb-4 p-2 w-full border rounded-md'
        />
        {/* Input field to confirm password */}
        <input
          type='password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder='Confirm Password'
          required
          className='mb-4 p-2 w-full border rounded-md'
        />
        {error && <p className='text-red-500 mb-4'>{error}</p>} {/* Display error messages if any */}
        {/* Submit button */}
        <button type='submit' className='w-full p-2 bg-blue-600 text-white rounded-md'>
          Sign Up
        </button>
      </form>
      {/* Link to the sign-in page if the user already has an account */}
      <p className='mt-4'>Already have an account?</p>
      <a href='/auth/signin' className='text-blue-500 hover:underline'>
        Sign In
      </a>
    </div>
  );
}
