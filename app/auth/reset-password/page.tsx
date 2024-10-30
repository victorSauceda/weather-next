"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ResetPasswordProps {
  searchParams: { token?: string; email?: string };
}

export default function ResetPassword({ searchParams }: ResetPasswordProps) {
  const router = useRouter();
  const token = searchParams.token || "";
  const email = searchParams.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true); // Disable button during submission

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password reset successful! Redirecting to sign-in page...");
        router.push("/auth/signin"); // Redirect immediately
      } else {
        setError(data.message || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Error during password reset:", err);
    } finally {
      setIsSubmitting(false); // Re-enable submit button
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Reset Password</h2>
        {message && <p className="text-green-500 text-center mt-4">{message}</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
