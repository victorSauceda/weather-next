"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear any previous errors

    const res = await signIn("credentials", {
      redirect: false,
      callbackUrl: "/dashboard",
      email,
      password,
    });

    setLoading(false);

    // Log the full response for debugging
    console.log("SignIn Response:", res);

    // Check for errors and handle them more specifically
    if (res?.error) {
      // Generic invalid credentials message, as we may not receive specifics
      if (res.status === 401 || res.error.includes("credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } else if (!res?.ok) {
      // Catch-all for any other unexpected response
      setError("Unable to sign in at this time. Please check your credentials.");
    } else {
      // Redirect manually upon success
      window.location.href = res.url || "/dashboard";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mt-8">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="mb-4 p-2 w-full border rounded-md"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="mb-4 p-2 w-full border rounded-md"
      />
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 ${
          loading ? "bg-blue-400" : "bg-blue-600"
        } text-white rounded-md`}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
