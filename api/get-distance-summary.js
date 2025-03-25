// api/get-distance-summary.js

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
    try {
      // Fetch all distances and timestamps from Supabase
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/distances?select=distance,timestamp`, {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        }
      });
  
      if (!response.ok) {
        const errText = await response.text();
        return res.status(500).json({ error: 'Failed to fetch distances from Supabase', details: errText });
      }
  
      const entries = await response.json();
  
      // Aggregate only unique days (based on parsed date from timestamp)
      const seenDays = new Set();
      let total = 0;
  
      for (const entry of entries) {
        const parsed = Date.parse(entry.timestamp);
        if (isNaN(parsed)) continue;
        const dayKey = new Date(parsed).toISOString().split('T')[0];
        if (!seenDays.has(dayKey)) {
          seenDays.add(dayKey);
          total += Number(entry.distance) || 0;
        }
      }
  
      return res.status(200).json({ total });
  
    } catch (err) {
      console.error('[Server Error]', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }
  