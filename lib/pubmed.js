/**
 * Shared PubMed literature search function
 * Queries NCBI E-utilities (esearch + esummary)
 */

/**
 * @param {{ query?: string, limit?: number }} [params]
 */
export async function searchPubMed({ query = '', limit = 10 } = {}) {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    const error = new Error('Query parameter is required');
    error.status = 400;
    throw error;
  }

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), 20);

  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(cleanQuery)}&retmode=json&retmax=${safeLimit}&sort=pub_date`;

  const searchRes = await fetch(searchUrl, {
    headers: { 'Accept': 'application/json' }
  });

  if (!searchRes.ok) {
    const error = new Error(`NCBI PubMed search failed with upstream status ${searchRes.status}`);
    error.status = searchRes.status;
    throw error;
  }

  const searchData = await searchRes.json();
  const ids = searchData?.esearchresult?.idlist || [];

  if (ids.length === 0) {
    return {
      items: [],
      source: 'NCBI PubMed E-utilities',
      fetched_at: new Date().toISOString()
    };
  }

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.slice(0, 20).join(',')}&retmode=json`;

  const summaryRes = await fetch(summaryUrl, {
    headers: { 'Accept': 'application/json' }
  });

  if (!summaryRes.ok) {
    const error = new Error(`NCBI PubMed summary retrieval failed with upstream status ${summaryRes.status}`);
    error.status = summaryRes.status;
    throw error;
  }

  const summaryData = await summaryRes.json();
  const resultObj = summaryData?.result || {};

  const items = ids.slice(0, safeLimit).map((id) => {
    const item = resultObj[id];
    if (!item) return null;
    const authorsList = Array.isArray(item.authors)
      ? item.authors.map((a) => (typeof a === 'string' ? a : a.name)).filter(Boolean)
      : [];
    const doiObj = Array.isArray(item.articleids)
      ? item.articleids.find((a) => a.idtype === 'doi')
      : null;

    return {
      pmid: id,
      title: item.title ? item.title.replace(/<[^>]+>/g, '').trim() : 'Untitled',
      authors: authorsList,
      journal: item.source || item.fulljournalname || 'Unknown Journal',
      pub_date: item.pubdate || item.sortpubdate || '',
      volume: item.volume || '',
      issue: item.issue || '',
      pages: item.pages || '',
      doi: doiObj ? doiObj.value : null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
    };
  }).filter(Boolean);

  return {
    items: items.slice(0, 20),
    source: 'NCBI PubMed E-utilities',
    fetched_at: new Date().toISOString()
  };
}
