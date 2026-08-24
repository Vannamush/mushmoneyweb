// Minimal CSV parser: handles quoted fields, escaped quotes, CRLF.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row.map((v) => v.trim()));
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row.map((v) => v.trim()));

  if (rows.length === 0) return { headers: [], rows: [] };
  return { headers: rows[0], rows: rows.slice(1) };
}

// "$1,234.56", "(45.20)", "-12.99" -> number (negative for credits/debits as written)
export function parseAmount(raw) {
  if (raw == null) return NaN;
  let s = String(raw).trim();
  let neg = false;
  if (/^\(.*\)$/.test(s)) {
    neg = true;
    s = s.slice(1, -1);
  }
  if (s.startsWith('-')) {
    neg = true;
    s = s.slice(1);
  }
  s = s.replace(/[^0-9.]/g, '');
  const n = parseFloat(s);
  if (isNaN(n)) return NaN;
  return neg ? -n : n;
}

// Supports YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY (US-first), MM-DD-YYYY -> "YYYY-MM-DD"
export function parseDate(raw) {
  const s = String(raw || '').trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${pad(iso[2])}-${pad(iso[3])}`;
  const us = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
  if (us) {
    let year = us[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${pad(us[1])}-${pad(us[2])}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return null;
}

const pad = (v) => String(v).padStart(2, '0');

// Best-guess mapping of CSV headers to our fields.
export function guessColumns(headers) {
  const find = (patterns) => headers.find((h) => patterns.some((p) => h.toLowerCase().includes(p))) || '';
  return {
    date: find(['date', 'posted', 'time']),
    description: find(['description', 'name', 'memo', 'payee', 'merchant', 'details']),
    amount: find(['amount', 'debit', 'value', 'total']),
  };
}