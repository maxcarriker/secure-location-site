// api/get-location.js

export default async function handler(req, res) {
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/locations?select=lat,lon,timestamp&order=timestamp.desc&limit=1`, {
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

    return res.status(200).json({ location: data[0] });

  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
