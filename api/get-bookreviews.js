// api/get-bookreviews.js

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  try {
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

    const emojiStars = (stars) => {
      const match = stars.match(/(\d+)/);
      if (!match) return stars;
      const num = Math.min(parseInt(match[1]), 5);
      return '⭐'.repeat(num);
    };

    const getCoverUrl = async (title) => {
      try {
        const query = encodeURIComponent(title);
        const res = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=1`);
        const data = await res.json();
        if (data.docs && data.docs[0]) {
          const doc = data.docs[0];
          if (doc.cover_i) {
            return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          }
        }
      } catch (err) {
        console.warn(`No cover found for title: ${title}`);
      }
      return null;
    };

    const enrichedReviews = await Promise.all(
      reviews.map(async (r) => {
        const coverUrl = await getCoverUrl(r.title);
        return {
          ...r,
          emojiStars: emojiStars(r.stars),
          coverUrl,
        };
      })
    );

    const sorted = enrichedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ reviews: sorted });

  } catch (err) {
    console.error('[Server Error]', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
