/**
 * Shared senior health & geriatric care news service
 * Queries Google News RSS syndication feeds
 */

/**
 * @param {{ topic?: string, country?: string }} [params]
 */
export async function fetchNews({ topic = '', country = 'US' } = {}) {
  const safeCountry = (country && country.trim().length === 2 ? country.trim().toUpperCase() : 'US');
  const baseTopic = (topic || '').trim();
  const searchPhrase = baseTopic
    ? `${baseTopic} (elder OR senior OR geriatric OR "older adults" OR aging)`
    : 'senior care geriatric health aging elderly';

  const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchPhrase)}&hl=en-${safeCountry}&gl=${safeCountry}&ceid=${safeCountry}:en`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const error = new Error(`News feed request failed with network error`);
    error.status = 502;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = new Error(`News feed failed with upstream status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  const xmlText = await response.text();
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlText)) !== null && items.length < 20) {
    const itemContent = match[1];
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
    const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent);
    const sourceMatch = /<source[^>]*>([\s\S]*?)<\/source>/.exec(itemContent);

    const rawTitle = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
    const cleanTitle = rawTitle.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

    items.push({
      title: cleanTitle || 'Untitled News Article',
      url: linkMatch ? linkMatch[1].trim() : '',
      pub_date: pubDateMatch ? pubDateMatch[1].trim() : '',
      source: sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : 'Global Health Syndication',
      country: safeCountry
    });
  }

  return {
    items: items.slice(0, 20),
    source: 'Google News RSS syndication',
    fetched_at: new Date().toISOString()
  };
}
