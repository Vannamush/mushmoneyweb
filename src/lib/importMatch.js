// Built-in keyword hints: keyword -> category name hint.
export const DEFAULT_KEYWORDS = [
  { keyword: 'UBER', hint: 'gas' },
  { keyword: 'LYFT', hint: 'gas' },
  { keyword: 'SHELL', hint: 'gas' },
  { keyword: 'CHEVRON', hint: 'gas' },
  { keyword: 'EXXON', hint: 'gas' },
  { keyword: 'BP ', hint: 'gas' },
  { keyword: 'KROGER', hint: 'food' },
  { keyword: 'CHIPOTLE', hint: 'food' },
  { keyword: 'STARBUCKS', hint: 'food' },
  { keyword: 'MCDONALD', hint: 'food' },
  { keyword: 'WHOLE FOODS', hint: 'food' },
  { keyword: 'TRADER JOE', hint: 'food' },
  { keyword: 'SAFEWAY', hint: 'food' },
  { keyword: 'DOORDASH', hint: 'food' },
  { keyword: 'NETFLIX', hint: 'subscriptions' },
  { keyword: 'SPOTIFY', hint: 'subscriptions' },
  { keyword: 'HULU', hint: 'subscriptions' },
  { keyword: 'DISNEY', hint: 'subscriptions' },
  { keyword: 'APPLE.COM/BILL', hint: 'subscriptions' },
  { keyword: 'AMAZON PRIME', hint: 'subscriptions' },
  { keyword: 'RENT', hint: 'rent' },
  { keyword: 'MORTGAGE', hint: 'rent' },
  { keyword: 'CINEMA', hint: 'fun' },
  { keyword: 'AMC ', hint: 'fun' },
  { keyword: 'STEAM', hint: 'fun' },
];

// Resolve built-in hints to this app's actual categories by name.
export function buildDefaultRules(categories) {
  return DEFAULT_KEYWORDS.map((d) => {
    const cat = categories.find((c) => c.name.toLowerCase().includes(d.hint) || d.hint.includes(c.name.toLowerCase()));
    return cat ? { keyword: d.keyword, category_id: cat.id } : null;
  }).filter(Boolean);
}

// User rules win over built-ins; longer keywords win over shorter ones.
export function matchCategory(description, userRules, defaultRules) {
  const text = String(description || '').toUpperCase();
  const ordered = [
    ...[...userRules].sort((a, b) => b.keyword.length - a.keyword.length),
    ...[...defaultRules].sort((a, b) => b.keyword.length - a.keyword.length),
  ];
  const hit = ordered.find((r) => r.keyword && text.includes(r.keyword.toUpperCase().trim()));
  return hit ? hit.category_id : '';
}

export const dupeKey = (date, amount, note) =>
  `${date}|${Number(amount).toFixed(2)}|${String(note || '').trim().toLowerCase()}`;