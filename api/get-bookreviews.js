// api/get-bookreviews.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
    // Fetch title, stars, review, and created_at from the Supabase 'bookreviews' table
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/bookreviews?select=title,stars,review,created_at`, {
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

    // Convert star ratings into emojis (max 5 stars)
    const emojiStars = (stars) => {
      const match = stars.match(/(\d+)/);
      if (!match) return stars;
      const num = Math.min(parseInt(match[1]), 5);
      return '⭐'.repeat(num);
    };

    // Create Open Library cover URL from title (simple fallback method)
    const getCoverUrl = (title) => {
      const encoded = encodeURIComponent(title.trim().toLowerCase());
      return `https://covers.openlibrary.org/b/olid/${encoded}-M.jpg`; // optionally replace with API-based lookup
    };

    // Format and sort reviews by date descending
    const formattedReviews = reviews
      .map(r => ({
        ...r,
        emojiStars: emojiStars(r.stars),
        coverUrl: getCoverUrl(r.title),
      }))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ reviews: formattedReviews });

  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
