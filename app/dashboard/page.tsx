'use client';
import { useEffect, useState } from 'react';
import { signIn, getSession} from 'next-auth/react';
import {Session} from 'next-auth';
import AutocompleteSearch, { City } from '../components/AutocompleteSearch'; // Import City interface from AutocompleteSearch
import Link from 'next/link';

export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<City[]>([]);
   
  useEffect(() => {
    const checkSession = async () => {
      const sessionData = await getSession();
      console.log(sessionData)
      if (!sessionData) {
        signIn();
      } else {
        setSession(sessionData);
        setLoading(false); 
      }
    };
    checkSession();  
}, []);

// Load favorite cities from MongoDB when the component mounts
  useEffect(() => { 
    if (!session)return;
    async function fetchFavorites() {
      try {
        const response = await fetch('/api/user/favorites'); // Fetch user's favorites from MongoDB
        if (!response.ok) throw new Error('Failed to fetch favorites');
        const data = await response.json();
        console.log(data);
        setFavorites(data);
      } catch (error) {
        console.error('Error fetching favorite cities:', error);
      }
    }
    fetchFavorites();
  }, [session]);

 

  // Function to add a city to the favorites list
  const addCityToFavorites = async (city: City) => {
    try {
      const response = await fetch('/api/user/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city })
      });


      const updatedFavorites = await response.json();
            if (!response.ok) throw new Error('Failed to add city');
          if (response.status === 200 && updatedFavorites.message === 'City already in favorites') {
      console.log('City already in favorites');
      alert('City already in your favorites!');
      return;
    }
      console.log({updatedFavorites})
      setFavorites(updatedFavorites); // Update favorites list after successful addition
    } catch (error) {
      console.error('Error adding city to favorites:', error);
    }
  };

  // Function to remove a city from the favorites list
const removeCityFromFavorites = async (cityId: number) => {
  console.log(`Initiating removal of city with ID: ${cityId}`);

  try {
    console.log(`Sending DELETE request to /api/user/removeFavorite for city ID: ${cityId}`);
    
    const response = await fetch('/api/user/removeFavorite', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityId }),
    });

    console.log(`Received response from DELETE request with status: ${response.status}`);

    if (!response.ok) {
      console.error(`Failed to remove city with ID: ${cityId}. Status: ${response.status}`);
      throw new Error('Failed to remove city');
    }

    const updatedFavorites = await response.json();
    console.log('Updated favorites received from server:', updatedFavorites);

    // Update state with new favorites
    setFavorites(updatedFavorites);
    console.log('Favorites state updated successfully');

  } catch (error) {
    console.error('Error removing city from favorites:', error);
  }
};

  if (loading){return <p>Loading...</p>}
  if (!session ){return <p>Redirection...</p>}

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
