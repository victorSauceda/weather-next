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
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  const toggleEditField = (field: string) => {
    setEditingField(editingField === field ? null : field);
    setMessage(null);
    setError(null);
  };

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
      signOut();
      router.push("/");
    } else {
      setDeleteMessage("Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg space-y-6">
        <h2 className="text-3xl font-semibold text-center text-gray-800">
          User Profile
        </h2>
        {message && <p className="text-center text-green-500">{message}</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Name Field */}
        <div>
          <label className="text-gray-700 font-medium">Name</label>
          {editingField === "name" ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="mt-1 text-gray-800">{name}</p>
          )}
          <button
            onClick={() => toggleEditField("name")}
            className="mt-2 text-blue-600 hover:underline"
          >
            {editingField === "name" ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Email Field */}
        <div>
          <label className="text-gray-700 font-medium">Email</label>
          {editingField === "email" ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="mt-1 text-gray-800">{email}</p>
          )}
          <button
            onClick={() => toggleEditField("email")}
            className="mt-2 text-blue-600 hover:underline"
          >
            {editingField === "email" ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Password Field */}
        <div>
          <label className="text-gray-700 font-medium">Password</label>
          {editingField === "password" ? (
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="mt-1 text-gray-800">********</p>
          )}
          <button
            onClick={() => toggleEditField("password")}
            className="mt-2 text-blue-600 hover:underline"
          >
            {editingField === "password" ? "Cancel" : "Edit"}
          </button>
        </div>

        {/* Save Changes Button */}
        {editingField && (
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        )}

        {/* Go Back to Dashboard */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-4 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
        >
          Go Back to Dashboard
        </button>

        {/* Delete Account Section */}
        <div className="border-t pt-6 mt-4">
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            {deleteMode ? "Cancel" : "Delete Account"}
          </button>
          {deleteMode && (
            <div className="mt-4 space-y-3">
              <p className="text-gray-700 text-center">
                Type <span className="font-semibold">"delete account"</span> to
                confirm.
              </p>
              <input
                type="text"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                placeholder='Type "delete account"'
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
              >
                Confirm Delete Account
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
          )}
        </div>
      </div>
    </div>
  );
}
