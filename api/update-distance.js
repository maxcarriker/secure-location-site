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

  const { distance, timestamp } = req.body;

  if (!distance || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Normalize incoming timestamp to a comparable date string
    const parsedIncoming = Date.parse(timestamp);
    if (isNaN(parsedIncoming)) {
      return res.status(400).json({ error: 'Invalid timestamp format' });
    }
    const incomingDate = new Date(parsedIncoming).toISOString().split('T')[0];

    // Step 1: fetch all existing timestamps
    const checkRes = await fetch(`${process.env.SUPABASE_URL}/rest/v1/distances?select=timestamp`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`
      }
    });

    if (!checkRes.ok) {
      throw new Error('Failed to check existing distances');
    }

    const existingEntries = await checkRes.json();

    // Step 2: check if the same date is already present
    const alreadyPosted = existingEntries.some(entry => {
      const parsedEntry = Date.parse(entry.timestamp);
      if (isNaN(parsedEntry)) return false;
      const entryDate = new Date(parsedEntry).toISOString().split('T')[0];
      return entryDate === incomingDate;
    });

    // Step 3: only insert if not already posted for that date
    if (!alreadyPosted) {
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/distances`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_SERVICE_ROLE,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify({ distance, timestamp })
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(500).json({ error: 'Supabase insert failed', details: errText });
      }

      const data = await response.json();
      return res.status(200).json({ success: true, inserted: data });
    } else {
      return res.status(200).json({ success: false, message: 'Distance already posted for this date.' });
    }

  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}