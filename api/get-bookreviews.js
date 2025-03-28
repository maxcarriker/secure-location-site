// api/get-bookreviews.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    // Fetch title, stars, and review from the Supabase 'bookreviews' table
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/bookreviews?select=title,stars,review`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'Failed to fetch book reviews from Supabase', details: errText });
    }

    const reviews = await response.json();

    // Optional: parse star ratings into emojis (basic example)
    const emojiStars = (stars) => {
      const match = stars.match(/(\d+)/);
      if (!match) return stars;
      const num = Math.min(parseInt(match[1]), 5);
      return '⭐'.repeat(num);
    };

    // Add parsed emoji stars for each review
    const formattedReviews = reviews.map(r => ({
      ...r,
      emojiStars: emojiStars(r.stars)
    }));

    return res.status(200).json({ reviews: formattedReviews });

  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
