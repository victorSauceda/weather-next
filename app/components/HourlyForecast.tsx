'use client';
import React from 'react';

export interface ForecastProps {
  forecast: ForecastData;
  convertToFahrenheit: (temp: number) => number;
}

export interface ForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: {
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: {
      id: number;
      main: string;
      description: string;
      icon: string;
    }[];
    clouds: { all: number };
    wind: { speed: number; deg: number; gust: number };
    visibility: number;
    pop: number;
    rain?: { '3h': number };
    sys: { pod: string };
    dt_txt: string;
  }[];
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export default function HourlyForecast({ forecast, convertToFahrenheit }: ForecastProps) {
  return (
    <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-6 lg:grid-cols-6'>
      {forecast.list.slice(0, 12).map((item, index) => (
        <div key={index} className='bg-blue-600 p-4 rounded-lg shadow-md flex flex-col items-center'>
          <p className='font-bold'>
            {index === 0 ? 'NOW' : new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <img src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`} alt={item.weather[0].description} className='w-12 h-12' />
          <p>{convertToFahrenheit(item.main.temp).toFixed(1)}°F</p>
        </div>
      ))}
    </div>
  );
}
