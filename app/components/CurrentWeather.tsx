'use client';
import React from 'react';

export interface WeatherProps {
  name: string;
  weather: [{ description: string; icon: string }];
  main: { temp: number; temp_min: number; temp_max: number };
  sys: { country: string; sunrise: number; sunset: number };
}

export default function CurrentWeather({ name, weather, main, sys }: WeatherProps) {
  return (
    <div className='bg-blue-600 text-white p-6 rounded-lg shadow-md'>
      <h2 className='text-4xl font-bold mb-4'>{`${name}, ${sys.country}`}</h2>
      <p className='text-xl'>Current Temperature: {main.temp}°F</p>
      <p className='text-lg'>Min: {main.temp_min}°F - Max: {main.temp_max}°F</p>
      <p className='text-lg'>{weather[0].description}</p>
      <p className='text-lg'>Sunrise: {new Date(sys.sunrise * 1000).toLocaleTimeString()} - Sunset: {new Date(sys.sunset * 1000).toLocaleTimeString()}</p>
      <img src={`https://openweathermap.org/img/wn/${weather[0].icon}.png`} alt={weather[0].description} className='w-16 h-16' />
    </div>
  );
}
