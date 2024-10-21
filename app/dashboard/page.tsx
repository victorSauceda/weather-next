'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import AutocompleteSearch, { City } from '../components/AutocompleteSearch'; // Import City interface from AutocompleteSearch
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();

  // Redirect to sign-in page if no session is found
  if (!session) {
    signIn();
    return <p>Redirecting...</p>; // Display a message while redirecting
  }

  const [favorites, setFavorites] = useState<City[]>([]);

  // Load favorite cities from MongoDB when the component mounts
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch('/api/user/favorites'); // Fetch user's favorites from MongoDB
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorite cities:', error);
      }
    }
    fetchFavorites();
  }, []);

  // Function to add a city to the favorites list
  const addCityToFavorites = async (city: City) => {
    try {
      const response = await fetch('/api/user/addFavorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city })
      });
      if (!response.ok) throw new Error('Failed to add city');
      const updatedFavorites = await response.json();
      setFavorites(updatedFavorites); // Update favorites list after successful addition
    } catch (error) {
      console.error('Error adding city to favorites:', error);
    }
  };

  // Function to remove a city from the favorites list
  const removeCityFromFavorites = async (cityId: number) => {
    try {
      const response = await fetch('/api/user/removeFavorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cityId })
      });
      if (!response.ok) throw new Error('Failed to remove city');
      const updatedFavorites = await response.json();
      setFavorites(updatedFavorites); // Update favorites list after successful removal
    } catch (error) {
      console.error('Error removing city from favorites:', error);
    }
  };

  return (
    <div className='min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-6'>
      <h1 className='text-4xl font-bold mb-8'>Welcome, {session.user?.name}! Here are your Favorite Locations</h1>

      <AutocompleteSearch mode='dashboard' onSelectCity={addCityToFavorites} />

      <div className='mt-6'>
        {favorites.length === 0 ? (
          <p>No favorite locations yet. Add some from the search above.</p>
        ) : (
          <ul>
            {favorites.map((city) => (
              <li key={city.id} className='mt-2 flex justify-between items-center'>
                <Link href={`/location/${city.id}`} className='text-blue-500 hover:underline'>
                  {city.name}
                  {city.state ? `, ${city.state}` : ''}, {city.country}
                </Link>
                <button onClick={() => removeCityFromFavorites(city.id)} className='text-red-500 hover:underline ml-4'>
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
