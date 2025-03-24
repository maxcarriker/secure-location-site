// ==== Updated get-location.js with weather check ====
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    if (!global.latestLocation) {
      return res.status(404).json({ error: 'No location available' });
    }

    const { lat, lon, timestamp } = global.latestLocation;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing weather API key' });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(weatherUrl);
    const weatherData = await response.json();

    // Determine if it's raining based on weather conditions
    const isRaining = weatherData.weather?.some(condition =>
      condition.main.toLowerCase().includes('rain')
    );

    return res.status(200).json({
      raining: !!isRaining,
      updated: timestamp
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Weather lookup failed' });
  }
}
