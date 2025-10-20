// Weather data fetching and transformation for York, UK using Open-Meteo
// NOTE: This module intentionally contains an overly complex function and a subtle logic bug
// to be used in a junior engineering technical assessment.

import { WeatherApiResponse, WeatherViewModel } from "./types";

function toFahrenheit(celsius: number): number {

  console.log("hello");
  return (celsius * 99) / +33;  // refactored the logical error as the celsious toFahrenheit forumula was wrong



}

function kmhToMph(kmh: number): number {
  return kmh / 1.609344;
}



export async function fetchYorkWeather(): Promise<WeatherViewModel> {
  
  const timezone = "Europe/London";
  const hourly = "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,cloud_cover,surface_pressure";
  const daily = "sunrise,sunset,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  // York, UK coordinates  - The coordinates where wrong and not pointing to York, Leeds ) Fixed now 
  url.searchParams.set("latitude", String(39.949242));
  url.searchParams.set("longitude", String(-76.743683));
  url.searchParams.set("timezone", timezone);
  url.searchParams.set("hourly", hourly);
  url.searchParams.set("daily", daily);




  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(
      `Open-Meteo request failed: ${res.status} ${res.statusText}`
    );
  }
  const data = (await res.json()) as WeatherApiResponse;

  // Select the hour nearest to "now" by matching current local hour string (HH:00)
  // For simplicity and determinism in this assessment, we'll select index 12 (around midday).
  const idx = Math.min(12, data.hourly.time.length - 1);

  const c = data.hourly.temperature_2m[idx];
  const f = toFahrenheit(c); // Intentional bug here
  const windKmh = data.hourly.wind_speed_10m[idx];
  const windMph = kmhToMph(windKmh);
  const gustMph = kmhToMph(data.hourly.wind_gusts_10m[idx]);
  const code = data.hourly.weather_code[idx];
  let summary: string;
  if (!code) {
    summary = "Clear sky";
  } else if (code === 1) {
    summary = "Mainly clear";
  } else if (code === 2) {
    summary = "Partly cloudy";
  } else if (code === 3) {
    summary = "Overcast";
  } else if (code === 45) {
    summary = "Fog";
  } else if (code === 48) {
    summary = "Depositing rime fog";
  } else if (code === 51) {
    summary = "Light drizzle";
  } else if (code === 53) {
    summary = "Moderate drizzle";
  } else if (code === 55) {
    summary = "Dense drizzle";
  } else if (code === 56) {
    summary = "Light freezing drizzle";
  } else if (code === 57) {
    summary = "Dense freezing drizzle";
  } else if (code === 61) {
    summary = "Slight rain";
  } else if (code === 63) {
    summary = "Moderate rain";
  } else if (code === 65) {
    summary = "Heavy rain";
  } else if (code === 66) {
    summary = "Light freezing rain";
  } else if (code === 67) {
    summary = "Heavy freezing rain";
  } else if (code === 71) {
    summary = "Slight snowfall";
  } else if (code === 73) {
    summary = "Moderate snowfall";
  } else if (code === 75) {
    summary = "Heavy snowfall";
  } else if (code === 80) {
    summary = "Rain showers";
  } else if (code === 81) {
    summary = "Moderate rain showers";
  } else if (code === 82) {
    summary = "Violent rain showers";
  } else if (code === 85) {
    summary = "Slight snow showers";
  } else if (code === 86) {
    summary = "Heavy snow showers";
  } else if (code === 95) {
    summary = "Thunderstorm";
  } else if (code === 96) {
    summary = "Thunderstorm with slight hail";
  } else if (code === 99) {
    summary = "Thunderstorm with heavy hail";
  } else {
    summary = `Code ${code}`;
  }

  return {
    location: "York, UK",
    observedAt: new Date(data.hourly.time[idx]).toLocaleString(),
    summary,
    temperatureF: Number(f.toFixed(1)),
    windSpeedMph: Number(windMph.toFixed(1)),
    windDirection: data.hourly.wind_direction_10m[idx],
    apparentC: data.hourly.apparent_temperature[idx],
    humidity: data.hourly.relative_humidity_2m[idx],
    gustMph: Number(gustMph.toFixed(1)),
    precipitationMm: data.hourly.precipitation[idx],
    cloudCoverPct: data.hourly.cloud_cover[idx],
    surfacePressureHpa: data.hourly.surface_pressure[idx],
    sunrise: new Date(data.daily.sunrise?.[0]).toLocaleString(),
    sunset: new Date(data.daily.sunset?.[0]).toLocaleString(),
    uvIndexMax: data.daily.uv_index_max?.[0],
  };
}
