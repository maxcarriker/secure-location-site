// api/get-location.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    // Fetch latest location from Supabase
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/locations?select=lat,lon,timestamp,created_at&order=created_at.desc&limit=1`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'Failed to fetch location from Supabase', details: errText });
    }

    const data = await response.json();
    if (!data.length) {
      return res.status(404).json({ error: 'No location available' });
    }

    const location = data[0];

    // Fetch weather from OpenWeatherMap
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
    const weatherRes = await fetch(weatherUrl);

    if (!weatherRes.ok) {
      const weatherErr = await weatherRes.text();
      return res.status(500).json({ error: 'Weather fetch failed', details: weatherErr });
    }

    const weatherData = await weatherRes.json();
    const condition = weatherData?.weather?.[0]?.main?.toLowerCase() || '';
    const isRaining = condition.includes('rain');

    return res.status(200).json({
      weatherCondition: condition,
      isRaining,
      timestamp: location.timestamp
    });

  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
