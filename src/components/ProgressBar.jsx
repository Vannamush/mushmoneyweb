import React from 'react';

export default function ProgressBar({ value, max }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const over = value > max;
  const color = over ? 'bg-red-500' : pct >= 75 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}