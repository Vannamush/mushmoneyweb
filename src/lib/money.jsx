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

// Returns the YYYY-MM-DD of the start of the week containing `d`,
// based on whether weeks start Sunday or Monday.
export const weekKey = (d, weekStart = 'sunday') => {
  const date = new Date(d);
  const day = date.getDay(); // 0 = Sun .. 6 = Sat
  const offset = weekStart === 'monday' ? (day === 0 ? 6 : day - 1) : day;
  const start = new Date(date);
  start.setDate(date.getDate() - offset);
  return start.toISOString().slice(0, 10);
};