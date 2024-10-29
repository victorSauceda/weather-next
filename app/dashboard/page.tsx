"use client";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import AutocompleteSearch, { City } from "../components/AutocompleteSearch";
import Link from "next/link";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      emailVerified?: boolean; // Add custom field here
      image?: string;
    };
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<City[]>([]);
  const [showEmailVerifiedMessage, setShowEmailVerifiedMessage] =
    useState(false);

  useEffect(() => {
    if (status === "loading") return; // Wait until loading is complete

    if (status === "unauthenticated") {
      signIn(); // Redirect to sign-in if no session
      return;
    }

    // Show email verification message only once
    if (
      session?.user?.emailVerified &&
      !localStorage.getItem("emailVerifiedShown")
    ) {
      setShowEmailVerifiedMessage(true);
      localStorage.setItem("emailVerifiedShown", "true");
      setTimeout(() => {
        setShowEmailVerifiedMessage(false);
      }, 3000);
    }
  }, [status, session]);

  // Load favorite cities from MongoDB when the component mounts
  useEffect(() => {
    async function fetchFavorites() {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/user/favorites");
          if (!response.ok) throw new Error("Failed to fetch favorites");
          const data = await response.json();
          console.log(data);
          setFavorites(data);
        } catch (error) {
          console.error("Error fetching favorite cities:", error);
        }
      }
    }
    fetchFavorites();
  }, []);

  const addCityToFavorites = async (city: City) => {
    try {
      const response = await fetch("/api/user/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city }),
      });
      if (!response.ok) throw new Error("Failed to add city");
      const updatedFavorites = await response.json();
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Error adding city to favorites:", error);
    }
  };

  const removeCityFromFavorites = async (cityId: number) => {
    try {
      const response = await fetch("/api/user/removeFavorite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cityId }),
      });
      if (!response.ok) throw new Error("Failed to remove city");
      const updatedFavorites = await response.json();
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error("Error removing city from favorites:", error);
    }
  };
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-8">
        Welcome, {session?.user?.name}! Here are your Favorite Locations
      </h1>

      {/* Display email verified message only once */}
      {showEmailVerifiedMessage && (
        <p className="mb-4 text-green-500">
          Your email has been verified! Enjoy full access to all features.
        </p>
      )}

      <AutocompleteSearch mode="dashboard" onSelectCity={addCityToFavorites} />

      <div className="mt-6">
        {favorites.length === 0 ? (
          <p>No favorite locations yet. Add some from the search above.</p>
        ) : (
          <ul>
            {favorites.map((city) => (
              <li
                key={city.id}
                className="mt-2 flex justify-between items-center"
              >
                <Link
                  href={`/location/${city.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {city.name}
                  {city.state ? `, ${city.state}` : ""}, {city.country}
                </Link>
                <button
                  onClick={() => removeCityFromFavorites(city.id)}
                  className="text-red-500 hover:underline ml-4"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
