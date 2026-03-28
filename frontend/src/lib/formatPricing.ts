const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
};

export const toPriceNumber = (value: unknown) => {
  const numeric = typeof value === 'number' ? value : Number(String(value ?? 0));
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getCurrencySymbol = (currency?: string) =>
  CURRENCY_SYMBOLS[currency?.toUpperCase() || 'INR'] || '₹';

export const formatPrice = (value: unknown, currency?: string) =>
  `${getCurrencySymbol(currency)}${toPriceNumber(value).toFixed(2)}`;
