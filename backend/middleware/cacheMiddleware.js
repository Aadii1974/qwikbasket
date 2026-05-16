/**
 * Simple in-memory TTL cache middleware for Express.
 * Use on public GET routes to slash DB round-trips.
 *
 * Usage:
 *   router.get('/', cache(60), handler);   // caches for 60 seconds
 */

const store = new Map(); // key → { body, expires }

/**
 * @param {number} ttlSeconds – How long to cache the response.
 */
const cache = (ttlSeconds = 30) => (req, res, next) => {
  // Only cache plain GET requests; skip if admin query param present
  if (req.method !== 'GET' || req.query.isAdmin === 'true') return next();

  const key = req.originalUrl;
  const hit = store.get(key);

  if (hit && hit.expires > Date.now()) {
    // Set cache-control so CDNs / browsers also benefit
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=30`);
    return res.json(hit.body);
  }

  // Intercept json() so we can store the response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      store.set(key, { body, expires: Date.now() + ttlSeconds * 1000 });
    }
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', `public, max-age=${ttlSeconds}, stale-while-revalidate=30`);
    return originalJson(body);
  };

  next();
};

/** Call this after any write (create/update/delete) to bust stale entries. */
const bustCache = (urlPattern) => {
  for (const key of store.keys()) {
    if (key.startsWith(urlPattern)) store.delete(key);
  }
};

module.exports = { cache, bustCache };
