/**
 * Shared WHO Demographics & Senior Health Indicators service
 * Queries the official WHO Global Health Observatory (GHO) Athena OData API
 */

const COUNTRY_MAP = {
  US: 'USA',
  USA: 'USA',
  GB: 'GBR',
  UK: 'GBR',
  GBR: 'GBR',
  CA: 'CAN',
  CAN: 'CAN',
  AU: 'AUS',
  AUS: 'AUS',
  JP: 'JPN',
  JPN: 'JPN',
  DE: 'DEU',
  DEU: 'DEU',
  FR: 'FRA',
  FRA: 'FRA',
  IT: 'ITA',
  ITA: 'ITA',
  ES: 'ESP',
  ESP: 'ESP',
  IN: 'IND',
  IND: 'IND',
  CN: 'CHN',
  CHN: 'CHN',
  BR: 'BRA',
  BRA: 'BRA',
  MX: 'MEX',
  MEX: 'MEX',
  KR: 'KOR',
  KOR: 'KOR',
  SG: 'SGP',
  SGP: 'SGP',
  NL: 'NLD',
  NLD: 'NLD',
  SE: 'SWE',
  SWE: 'SWE',
  CH: 'CHE',
  CHE: 'CHE'
};

const INDICATOR_NAMES = {
  WHOSIS_000001: 'Life expectancy at birth (years)',
  WHOSIS_000002: 'Healthy life expectancy (HALE) at birth (years)',
  WHOSIS_000015: 'Life expectancy at age 60 (years)',
  WHOSIS_000007: 'Healthy life expectancy (HALE) at age 60 (years)',
  WHS9_86: 'Probability (%) of dying between age 30 and exact age 70 from any of cardiovascular disease, cancer, diabetes, or chronic respiratory disease'
};

/**
 * @param {{ country?: string, indicator?: string }} [params]
 */
export async function getWhoDemographics({ country = 'USA', indicator = 'WHOSIS_000001' } = {}) {
  const rawCountry = (country || 'USA').trim().toUpperCase();
  const countryCode = COUNTRY_MAP[rawCountry] || (rawCountry.length === 3 ? rawCountry : 'USA');
  const indicatorCode = (indicator || 'WHOSIS_000001').trim();

  const url = `https://ghoapi.azureedge.net/api/${indicatorCode}?$filter=SpatialDim eq '${countryCode}'&$orderby=TimeDim desc&$top=20`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let res;
  try {
    res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const error = new Error(`WHO GHO API request failed with network error`);
    error.status = 502;
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const error = new Error(`WHO demographics lookup failed with upstream status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const data = await res.json();
  const records = data?.value || [];

  const items = records.slice(0, 20).map((r) => {
    let sexLabel = 'Total';
    if (r.Dim1 === 'SEX_BTSX') sexLabel = 'Both sexes';
    else if (r.Dim1 === 'SEX_MLE') sexLabel = 'Male';
    else if (r.Dim1 === 'SEX_FMLE') sexLabel = 'Female';
    else if (r.Dim1) sexLabel = r.Dim1;

    return {
      indicator: r.IndicatorCode,
      indicator_name: INDICATOR_NAMES[r.IndicatorCode] || r.IndicatorCode,
      country: r.SpatialDim,
      year: r.TimeDim,
      sex: sexLabel,
      value: typeof r.NumericValue === 'number' ? Math.round(r.NumericValue * 100) / 100 : null,
      display_value: r.Value || (r.NumericValue != null ? String(r.NumericValue) : 'N/A')
    };
  });

  return {
    items,
    source: 'WHO Global Health Observatory (GHO) Athena OData API',
    fetched_at: new Date().toISOString()
  };
}
