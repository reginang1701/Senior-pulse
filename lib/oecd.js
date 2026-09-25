/**
 * Shared OECD Demographic & Aging Population Data Service
 * Queries OECD Member indicators via World Bank Open Data API
 */

const OECD_INDICATOR_NAMES = {
  'SP.POP.DPND.OL': 'Age dependency ratio, old (% of working-age population)',
  'SP.POP.65UP.TO.ZS': 'Population ages 65 and above (% of total population)',
  'SP.DYN.LE00.IN': 'Life expectancy at birth, total (years)',
  'SH.XPD.CHEX.GD.ZS': 'Current health expenditure (% of GDP)'
};

const OECD_COUNTRIES = {
  OED: 'OECD Members (Aggregate)',
  USA: 'United States',
  JPN: 'Japan',
  DEU: 'Germany',
  GBR: 'United Kingdom',
  FRA: 'France',
  ITA: 'Italy',
  CAN: 'Canada',
  AUS: 'Australia',
  KOR: 'South Korea',
  SWE: 'Sweden',
  ESP: 'Spain',
  NLD: 'Netherlands',
  CHE: 'Switzerland'
};

/**
 * @param {{ country?: string, indicator?: string }} [params]
 */
export async function getOecdDemographics({ country = 'OED', indicator = 'SP.POP.DPND.OL' } = {}) {
  const rawCountry = (country || 'OED').trim().toUpperCase();
  const countryCode = OECD_COUNTRIES[rawCountry] ? rawCountry : (rawCountry.length === 3 ? rawCountry : 'OED');
  const indicatorCode = (indicator || 'SP.POP.DPND.OL').trim();

  const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=20`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const error = new Error(`OECD demographic data request failed with network error`);
    error.status = 502;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const error = new Error(`OECD demographic lookup failed with upstream status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  const records = Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];

  const items = records
    .filter((r) => r.value !== null)
    .slice(0, 20)
    .map((r) => {
      const numericVal = typeof r.value === 'number' ? Math.round(r.value * 100) / 100 : null;
      return {
        indicator: r.indicator?.id || indicatorCode,
        indicator_name: r.indicator?.value || OECD_INDICATOR_NAMES[indicatorCode] || indicatorCode,
        country_code: r.countryiso3code || countryCode,
        country_name: r.country?.value || OECD_COUNTRIES[countryCode] || countryCode,
        year: parseInt(r.date, 10),
        value: numericVal,
        unit: indicatorCode.includes('ZS') || indicatorCode.includes('OL') ? '%' : 'years'
      };
    });

  return {
    items,
    source: 'OECD Demographic Indicators via World Bank Open Data',
    fetched_at: new Date().toISOString()
  };
}
