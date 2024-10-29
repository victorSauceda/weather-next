"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignIn = () => router.push("/auth/signin");
  const handleSignOut = () => signOut({ callbackUrl: "/" });

  return (
    <header className="w-full bg-gray-50 dark:bg-gray-900 p-4 shadow-md fixed top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold text-blue-600 dark:text-indigo-400"
        >
          My Weather App
        </Link>

        {/* Right side: Sign In or User Menu */}
        <div className="relative">
          {session ? (
            <div>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile Picture"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-10 h-10 text-gray-500 dark:text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    View Account Details
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="text-blue-600 dark:text-indigo-400 hover:underline"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
