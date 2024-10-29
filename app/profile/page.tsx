"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  // Toggle editing mode for specific fields
  const toggleEditField = (field: string) => {
    setEditingField(editingField === field ? null : field);
    setMessage(null);
    setError(null);
  };

  // Handle profile update
  const handleSave = async () => {
    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: password || undefined }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Profile updated successfully.");
      setEditingField(null);
    } else {
      setError(data.message || "Failed to update profile.");
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (confirmDelete !== "delete account") {
      setDeleteMessage("Please type 'delete account' to confirm.");
      return;
    }

    const res = await fetch("/api/user/delete-account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setDeleteMessage("Account deleted successfully.");
      signOut(); // Sign out the user after deletion
      router.push("/"); // Redirect to home or another suitable page
    } else {
      setDeleteMessage("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">User Profile</h2>
        {message && (
          <p className="text-green-500 text-center mt-4">{message}</p>
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {/* Name Field */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          {editingField === "name" ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mt-2"
            />
          ) : (
            <p className="text-gray-800 mt-2">{name}</p>
          )}
          <button
            onClick={() => toggleEditField("name")}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            {editingField === "name" ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Email Field */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          {editingField === "email" ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mt-2"
            />
          ) : (
            <p className="text-gray-800 mt-2">{email}</p>
          )}
          <button
            onClick={() => toggleEditField("email")}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            {editingField === "email" ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Password Field */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          {editingField === "password" ? (
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mt-2"
            />
          ) : (
            <p className="text-gray-800 mt-2">********</p>
          )}
          <button
            onClick={() => toggleEditField("password")}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            {editingField === "password" ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Save Button */}
        {editingField && (
          <button
            onClick={handleSave}
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        )}

        {/* Go Back to Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-6 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
        >
          Go Back to Dashboard
        </button>

        {/* Delete Account */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Delete Account
          </label>
          <p className="text-gray-600 text-sm">
            Type "delete account" to permanently delete your account.
          </p>
          <input
            type="text"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            placeholder="Type 'delete account'"
            className="w-full px-4 py-2 border rounded-md mt-2"
          />
          <button
            onClick={handleDeleteAccount}
            className="w-full mt-4 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Delete Account
          </button>
          {deleteMessage && (
            <p
              className={`text-center mt-4 ${
                deleteMessage.includes("success")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {deleteMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
