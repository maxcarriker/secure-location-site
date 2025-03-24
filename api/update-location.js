// api/update-location.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const authHeader = req.headers.authorization || '';
    const expectedToken = process.env.LOCATION_SECRET;
  
    if (authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const { lat, lon, timestamp } = req.body;
  
    if (!lat || !lon || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    try {
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    console.log('SUPABASE_SERVICE_ROLE:', process.env.SUPABASE_SERVICE_ROLE ? 'present' : 'missing');
        
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_SERVICE_ROLE,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ lat, lon, timestamp })
      });
  
      if (!response.ok) {
        const errText = await response.text();
        return res.status(500).json({ error: 'Supabase insert failed', details: errText });
      }
  
      const data = await response.json();
      return res.status(200).json({ success: true, inserted: data });
    } catch (err) {
      console.error('[Server Error]', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }
  