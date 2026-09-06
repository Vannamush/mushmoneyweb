// Maps a bill name to a contextual emoji + tint color.
const RULES = [
  { keys: ['trash', 'garbage', 'waste', 'recycl'], emoji: '🗑️', color: '#64748b' },
  { keys: ['water', 'sewer'], emoji: '💧', color: '#3b82f6' },
  { keys: ['electric', 'power', 'light'], emoji: '💡', color: '#f59e0b' },
  { keys: ['gas', 'propane', 'heating'], emoji: '🔥', color: '#f97316' },
  { keys: ['internet', 'wifi', 'broadband', 'fiber', 'spectrum', 'comcast', 'verizon fios'], emoji: '📡', color: '#6366f1' },
  { keys: ['phone', 'mobile', 'cell', 'cellular', 't-mobile', 'at&t'], emoji: '📱', color: '#14b8a6' },
  { keys: ['rent', 'mortgage', 'lease'], emoji: '🏠', color: '#10b981' },
  { keys: ['insurance', 'insur'], emoji: '🛡️', color: '#3b82f6' },
  { keys: ['car', 'auto', 'vehicle'], emoji: '🚗', color: '#06b6d4' },
  { keys: ['fuel', 'gas station'], emoji: '⛽', color: '#ef4444' },
  { keys: ['netflix', 'hulu', 'disney', 'stream', 'youtube tv', 'max', 'prime video'], emoji: '🎬', color: '#ef4444' },
  { keys: ['spotify', 'music', 'apple music', 'pandora'], emoji: '🎵', color: '#10b981' },
  { keys: ['gym', 'fitness', 'planet', 'equinox'], emoji: '🏋️', color: '#8b5cf6' },
  { keys: ['grocer', 'food', 'kroger', 'walmart', 'aldi'], emoji: '🛒', color: '#10b981' },
  { keys: ['credit', 'card'], emoji: '💳', color: '#6366f1' },
  { keys: ['loan', 'student', 'tuition', 'school'], emoji: '🏦', color: '#0ea5e9' },
  { keys: ['subscription', 'sub '], emoji: '🔄', color: '#8b5cf6' },
  { keys: ['pet', 'vet'], emoji: '🐾', color: '#f59e0b' },
  { keys: ['donation', 'charity', 'church'], emoji: '❤️', color: '#ec4899' },
];

const DEFAULT = { emoji: '🧾', color: '#f59e0b' };

export function getBillIcon(name) {
  if (!name) return DEFAULT;
  const lower = name.toLowerCase();
  for (const r of RULES) {
    if (r.keys.some((k) => lower.includes(k))) return r;
  }
  return DEFAULT;
}