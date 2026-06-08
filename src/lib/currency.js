export const CURRENCY_MAP = {
  ZA: { symbol: 'R', code: 'ZAR' },
  KE: { symbol: 'KSh', code: 'KES' },
  GB: { symbol: '£', code: 'GBP' },
  DE: { symbol: '€', code: 'EUR' },
  FR: { symbol: '€', code: 'EUR' },
  NL: { symbol: '€', code: 'EUR' },
  ES: { symbol: '€', code: 'EUR' },
  SE: { symbol: 'kr', code: 'SEK' },
};

export function getCurrencySymbol(countryCode) {
  return CURRENCY_MAP[countryCode]?.symbol || 'R';
}