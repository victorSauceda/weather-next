// pages/auth/forgot-password.tsx
"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage(
        "If your email is registered, you will receive a reset link shortly."
      );
    } else {
      setMessage("Failed to send reset link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold">Forgot Password</h2>
        {message && <p className="text-center text-green-500">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
