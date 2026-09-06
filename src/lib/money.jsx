let currentCurrency = 'USD';

export const setCurrency = (code) => {
  if (code) currentCurrency = code;
};

export const getCurrency = () => currentCurrency;

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCurrency, maximumFractionDigits: 0 }).format(Number(n) || 0);

export const formatCurrencyExact = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currentCurrency }).format(Number(n) || 0);

export const daysInMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

export const daysLeftInMonth = (d = new Date()) => Math.max(1, daysInMonth(d) - d.getDate() + 1);

export const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export const isSameMonth = (dateStr, d = new Date()) => {
  const dt = new Date(dateStr);
  return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
};