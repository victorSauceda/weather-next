'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import cityList from '../../public/city.list.json'; // Import the city list

export interface City {
  id: number;
  name: string;
  state?: string;
  country: string;
  coord: {
    lon: number;
    lat: number;
  };
}
// Cast the cityList as an array of City objects
const cities: City[] = cityList as City[];

interface AutocompleteSearchProps {
  onSelectCity?: (city: City) => void; // Pass selected city to the parent (Dashboard)
  mode: 'home' | 'dashboard'; // Mode to determine behavior (home or dashboard)
}

export default function AutocompleteSearch({ onSelectCity, mode }: AutocompleteSearchProps) {
  const [city, setCity] = useState<string>(''); // State to store the user input
  const [suggestions, setSuggestions] = useState<City[]>([]); // State to store the city suggestions
  const router = useRouter(); // Initialize the router for navigation

  // Function to fetch city suggestions based on user input
  const fetchCitySuggestions = (query: string) => {
    if (query.length < 3) return; // Only fetch when input is 3+ characters

    // Filter the city list to match the user's input
    const filteredCities = cities.filter((cityItem: City) =>
      cityItem.name.toLowerCase().startsWith(query.toLowerCase())
    );

    setSuggestions(filteredCities.slice(0, 5)); // Limit the suggestions to top 5
  };

  // Function to handle selecting a city from the suggestions
  const handleCitySelect = (city: City) => {
    setCity(''); // Clear the search input
    setSuggestions([]); // Hide the suggestions after selection

    // Behavior based on the `mode` prop
    if (mode === 'home') {
      // Navigate to the city's weather page on the home page
      router.push(`/location/${city.id}`);
    } else if (mode === 'dashboard' && onSelectCity) {
      // Add city to the favorites list on the dashboard
      onSelectCity(city);
    }
  };

  // Handle key press events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleCitySelect(suggestions[0]); // Select the first suggestion on Enter key press
    }
  };

  return (
    <div>
      <div className='flex items-center space-x-4'>
        <input
          type='text'
          value={city} // Bind the input value to city state
          onChange={(e) => {
            setCity(e.target.value); // Update the city state with user input
            fetchCitySuggestions(e.target.value); // Fetch suggestions based on input
          }}
          placeholder='Enter a city...'
          onKeyDown={handleKeyDown} // Add key down event listener
          className='p-2 border rounded-md text-gray-900'
        />
      </div>

      {/* Display suggestions if available */}
      {suggestions.length > 0 && (
        <ul className='border mt-2'>
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              className='p-2 hover:bg-gray-200 cursor-pointer'
              onClick={() => handleCitySelect(suggestion)} // Add to favorite when city is selected
            >
              {suggestion.name}
              {suggestion.state ? `, ${suggestion.state}` : ''},
              {suggestion.country}
              {/* Display city, state (if available), and country */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
