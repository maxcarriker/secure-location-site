export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const authHeader = req.headers.authorization;
    const secret = process.env.LOCATION_SECRET;

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const { lat, lon } = req.body;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Missing lat/lon' });
        }

        global.latestLocation = { lat, lon, updated: new Date().toISOString() };
        return res.status(200).json({ message: 'Location updated' });

    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
