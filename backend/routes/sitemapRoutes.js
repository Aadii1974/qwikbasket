const express = require('express');
const router  = express.Router();
const Product  = require('../models/Product');
const Category = require('../models/Category');
const Store    = require('../models/Store');

const BASE_URL   = 'https://realfarms.in';
const TODAY      = new Date().toISOString().split('T')[0]; // e.g. "2026-05-16"
const CACHE_TTL  = 6 * 60 * 60 * 1000; // 6 hours in ms

// ── In-memory cache ────────────────────────────────────────────────
let cachedXml       = null;
let cacheExpiresAt  = 0;

// ── Helper: escape special XML characters ─────────────────────────
const escXml = (str = '') =>
  String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');

// ── Helper: build a single <url> block ───────────────────────────
const urlBlock = ({ loc, lastmod = TODAY, changefreq = 'weekly', priority = '0.7' }) => `
  <url>
    <loc>${escXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;

// ── GET /api/sitemap.xml ───────────────────────────────────────────
router.get('/sitemap.xml', async (req, res) => {
  try {
    // Serve from cache if still fresh
    if (cachedXml && Date.now() < cacheExpiresAt) {
      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=21600'); // 6h browser cache
      return res.send(cachedXml);
    }

    // ── Fetch data in parallel ────────────────────────────────────
    const [products, categories, stores] = await Promise.all([
      Product.findAll({
        attributes: ['id', 'name', 'updatedAt'],
        where: { stock: { [require('sequelize').Op.gt]: 0 } }, // only in-stock
      }),
      Category.findAll({ attributes: ['id', 'slug', 'updatedAt'] }),
      Store.findAll({ attributes: ['id', 'updatedAt'] }),
    ]);

    // ── Static pages ─────────────────────────────────────────────
    const staticUrls = [
      urlBlock({ loc: `${BASE_URL}/`,             changefreq: 'daily',   priority: '1.0' }),
      urlBlock({ loc: `${BASE_URL}/categories`,   changefreq: 'weekly',  priority: '0.9' }),
      urlBlock({ loc: `${BASE_URL}/search`,       changefreq: 'daily',   priority: '0.9' }),
      urlBlock({ loc: `${BASE_URL}/bulk-basket`,  changefreq: 'weekly',  priority: '0.8' }),
      urlBlock({ loc: `${BASE_URL}/our-story`,    changefreq: 'monthly', priority: '0.7' }),
    ];

    // ── Dynamic: Categories (/category/:slug) ─────────────────────
    const categoryUrls = categories.map(cat =>
      urlBlock({
        loc:        `${BASE_URL}/category/${escXml(cat.slug)}`,
        lastmod:    cat.updatedAt ? cat.updatedAt.toISOString().split('T')[0] : TODAY,
        changefreq: 'weekly',
        priority:   '0.8',
      })
    );

    // ── Dynamic: Products (/product/:id) ──────────────────────────
    const productUrls = products.map(p =>
      urlBlock({
        loc:        `${BASE_URL}/product/${escXml(String(p.id))}`,
        lastmod:    p.updatedAt ? p.updatedAt.toISOString().split('T')[0] : TODAY,
        changefreq: 'weekly',
        priority:   '0.8',
      })
    );

    // ── Dynamic: Stores (/store/:id) ──────────────────────────────
    const storeUrls = stores.map(s =>
      urlBlock({
        loc:        `${BASE_URL}/store/${escXml(String(s.id))}`,
        lastmod:    s.updatedAt ? s.updatedAt.toISOString().split('T')[0] : TODAY,
        changefreq: 'weekly',
        priority:   '0.7',
      })
    );

    // ── Assemble XML ──────────────────────────────────────────────
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticUrls.join('')}
  <!-- ── Categories (${categoryUrls.length}) ── -->${categoryUrls.join('')}
  <!-- ── Products (${productUrls.length}) ── -->${productUrls.join('')}
  <!-- ── Stores (${storeUrls.length}) ── -->${storeUrls.join('')}
</urlset>`;

    // Store in cache
    cachedXml      = xml;
    cacheExpiresAt = Date.now() + CACHE_TTL;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=21600');
    return res.send(xml);

  } catch (err) {
    console.error('❌ Sitemap generation failed:', err.message);
    res.status(500).send('<?xml version="1.0"?><error>Sitemap generation failed</error>');
  }
});

module.exports = router;
