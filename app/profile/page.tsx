"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // For authenticating password changes
  const [editingField, setEditingField] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }

    if (status === "authenticated") {
      setName(session?.user?.name || "");
      setEmail(session?.user?.email || "");
    }
  }, [status, session, router]);

  const toggleEditField = (field: string) => {
    setEditingField(editingField === field ? null : field);
    setMessage(null);
    setError(null);
  };

  const handleSave = async () => {
    const isEmailUpdate =
      editingField === "email" && email !== session?.user?.email;
    const isPasswordUpdate = editingField === "password" && password;

    const endpoint = isPasswordUpdate
      ? "/api/auth/reset-password"
      : isEmailUpdate
      ? "/api/signup"
      : "/api/user/update-profile";
    const body = isPasswordUpdate
      ? { newPassword: password, currentPassword } // Only for password update
      : { name, email, password: password || undefined, isEmailUpdate };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          isEmailUpdate
            ? "Please check your email to verify your new address."
            : "Profile updated successfully."
        );
        setEditingField(null);

        if (isEmailUpdate) {
          setTimeout(() => {
            signOut();
            router.push("/auth/signin");
          }, 2000);
        }
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
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

  if (status === "loading") {
    return <div>Loading...</div>;
  }

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
              className="w-full text-black px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="mt-1 text-gray-800">{name || "N/A"}</p>
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
              className="w-full text-black px-3 py-2 mt-1 border border-gray-300 rounded-md"
            />
          ) : (
            <p className="mt-1 text-gray-800">{email || "N/A"}</p>
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
            <>
              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-black px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-black px-3 py-2 mt-1 border border-gray-300 rounded-md"
              />
            </>
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

        {editingField && (
          <button
            onClick={handleSave}
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        )}

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-4 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
        >
          Go Back to Dashboard
        </button>

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
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md"
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
