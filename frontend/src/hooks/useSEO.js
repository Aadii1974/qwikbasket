import { useEffect } from 'react';

const SITE_NAME = 'Real Farms';
const BASE_URL  = 'https://realfarms.in';
const OG_IMAGE  = `${BASE_URL}/og-image.jpg`;

/**
 * useSEO — sets page-level SEO meta dynamically.
 *
 * @param {object} options
 * @param {string} options.title        - Page-specific title (appended with " | Real Farms")
 * @param {string} options.description  - Meta description
 * @param {string} [options.canonical]  - Canonical path e.g. "/search"
 * @param {string} [options.ogImage]    - Override OG image URL
 * @param {string} [options.type]       - OG type (default "website")
 * @param {string[]} [options.keywords] - Additional keywords
 * @param {boolean} [options.noindex]   - Set to true for private pages
 */
const useSEO = ({
  title,
  description,
  canonical,
  ogImage = OG_IMAGE,
  type = 'website',
  keywords = [],
  noindex = false,
} = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

    // ── Title ──────────────────────────────────────────────
    document.title = fullTitle;

    const setMeta = (selector, attr, value) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.includes('property=')
          ? ['property', selector.match(/property="([^"]+)"/)?.[1]]
          : ['name', selector.match(/name="([^"]+)"/)?.[1]];
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    if (description) {
      setMeta('meta[name="description"]', 'content', description);
      setMeta('meta[property="og:description"]', 'content', description);
      setMeta('meta[name="twitter:description"]', 'content', description);
    }

    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:image"]', 'content', ogImage);
    setMeta('meta[name="twitter:image"]', 'content', ogImage);

    if (noindex) {
      setMeta('meta[name="robots"]', 'content', 'noindex, nofollow');
    } else {
      setMeta('meta[name="robots"]', 'content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // ── Canonical ──────────────────────────────────────────
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // ── Keywords ───────────────────────────────────────────
    const baseKeywords = 'Real Farms, real farms, realfarms, online grocery delivery India, fresh organic vegetables, dairy delivery, farm fresh groceries, farm to doorstep, organic food delivery, buy vegetables online, fresh fruits delivery, same day grocery delivery, zero middleman grocery, organic produce India, grocery app India, fresh grocery delivery';
    const allKeywords = keywords.length > 0 ? `${keywords.join(', ')}, ${baseKeywords}` : baseKeywords;
    setMeta('meta[name="keywords"]', 'content', allKeywords);

  }, [title, description, canonical, ogImage, type, noindex, keywords.join(',')]);
};

export default useSEO;
