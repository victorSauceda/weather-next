'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CurrentWeather, { WeatherProps } from '../../components/CurrentWeather';
import HourlyForecast, { ForecastProps } from '../../components/HourlyForecast';

export default function CityWeatherPage() {
  const [weather, setWeather] = useState<WeatherProps | null>(null); // State to store the current weather
  const [forecast, setForecast] = useState<ForecastProps['forecast'] | null>(null); // State to store the forecast data
  const [error, setError] = useState<string | null>(null); // State to store error messages
  const { Id } = useParams(); // Get cityId from the URL
  console.log({Id});
  
  console.log("api.key", process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY)

  // Fetch weather data for the city
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?id=${Id}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
        );
        if (!response.ok) throw new Error('Failed to fetch weather data'); // Handle errors
        const data: WeatherProps = await response.json();
        console.log(data);
        setWeather(data);
      } catch (error) {
        const err = error as Error;
        setError(err.message); // Set the error message in case of failure
      }
    };
    fetchWeatherData(); // Fetch weather data on component mount
  }, [Id]); // Refetch data when cityId changes

  // Fetch the 12-hour forecast
  useEffect(() => {
    const fetchForecastData = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?id=${Id}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}&units=metric`
        );
        if (!response.ok) throw new Error('Failed to fetch forecast data');
        const data = await response.json();
        console.log(data);
        setForecast(data); // Set forecast data to state
      } catch (error) {
        const err = error as Error;
        setError(err.message); // Set the error message in case of failure
      }
    };
    fetchForecastData(); // Fetch forecast data on component mount
  }, [Id]); // Refetch forecast data when cityId changes

  // Helper function to convert Celsius to Fahrenheit
  const convertToFahrenheit = (temp: number) => (temp * 9) / 5 + 32;

  if (error) {
    return <p className='text-red-500'>Error: {error}</p>; // Display error message if any
  }

  if (!weather || !forecast) {
    return <p>Loading weather data...</p>; // Display loading state while fetching data
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white'>
      {/* Back button */}
      <a href='/' className='text-left w-full mb-4 text-white'>&larr; Home</a>

      {/* Weather Display Section - Using the CurrentWeather component */}
      <CurrentWeather
        {...weather}
      />

      {/* 12-Hour Forecast Section - Using the HourlyForecast component */}
      <h2 className='text-2xl font-bold mt-8'>12 Hour Forecast</h2>
      <HourlyForecast forecast={forecast} convertToFahrenheit={convertToFahrenheit} />
    </div>
  );
}
