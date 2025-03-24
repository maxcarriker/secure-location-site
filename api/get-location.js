export default function handler(req, res) {
    if (!global.latestLocation) {
        return res.status(404).json({ error: 'No location available' });
    }

    const { lat, lon, updated } = global.latestLocation;
    return res.status(200).json({
        lat: Math.round(lat * 100) / 100,  // Round to 2 decimal places
        lon: Math.round(lon * 100) / 100,
        updated
    });
}
