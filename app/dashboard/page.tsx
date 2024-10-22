'use client';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import AutocompleteSearch, { City } from '../components/AutocompleteSearch'; // Import City interface from AutocompleteSearch
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession(); // Use NextAuth's useSession hook to check if the user is logged in

  // Redirect to sign-in page if no session is found

  useEffect(() => {
    if (status === "unauthenticated"){signIn()}
  },[status])

  const [favorites, setFavorites] = useState<City[]>([]); // State to store favorite cities

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
    if(session){
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }}
  }, [session]);

  // Save favorites to localStorage whenever they change
//   useEffect(() => {
//     if (favorites.length > 0) {
//       localStorage.setItem('favorites', JSON.stringify(favorites));
//     }
//   }, [favorites]);

  // Function to add a city to the favorites list
  const addCityToFavorites = (city: City) => {
    // Check if the city is already in the favorites list
    if (!favorites.find((fav) => fav.id === city.id)) {
      setFavorites([...favorites, city]);
    }
  };

  // Function to remove a city from the favorites list
  const removeCityFromFavorites = (cityId: number) => {
    const updatedFavorites = favorites.filter((city) => city.id !== cityId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Update localStorage after removal
  };

  if (status === "loading"){return <p>Loading...</p>}
  
  return session ? (
    <div className='min-h-screen text-black flex flex-col items-center justify-center bg-gray-100 p-6'>
      <h1 className='text-4xl font-bold mb-8'>Welcome, {session && session.user?.name}! Here are your Favorite Locations</h1>

      {/* Autocomplete search component to add cities */}
      <AutocompleteSearch mode='dashboard' onSelectCity={addCityToFavorites} />

      {/* Display the favorites list */}
      <div className='mt-6'>
        {favorites.length === 0 ? (
          <p>No favorite locations yet. Add some from the search above.</p>
        ) : (
          <ul>
            {favorites.map((city) => (
              <li key={city.id} className='mt-2 flex justify-between items-center'>
                {/* Display city as a clickable link */}
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
  ):(<p>Redirecting...</p>)
}
