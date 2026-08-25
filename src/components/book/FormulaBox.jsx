import React from 'react';
import { Scissors } from 'lucide-react';

const ROWS = [
  { key: 'style', label: 'Style' },
  { key: 'pattern', label: 'Pattern / part size' },
  { key: 'hair_type', label: 'Hair type used' },
  { key: 'retwist_schedule', label: 'Retwist schedule' },
  { key: 'style_duration', label: 'Time to install' },
];

export default function FormulaBox({ client }) {
  return (
    <div className="rounded-lg bg-primary text-primary-foreground border-l-4 border-brand p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Scissors className="h-4 w-4 text-brand" />
        <h2 className="font-display text-2xl tracking-[0.15em] leading-none">The Formula</h2>
      </div>
      <dl className="divide-y divide-primary-foreground/15">
        {ROWS.map((r) => (
          <div key={r.key} className="py-2">
            <dt className="text-[10px] uppercase tracking-[0.2em] opacity-60">{r.label}</dt>
            <dd className="text-base font-medium mt-0.5">{client[r.key] || <span className="opacity-40">Not set yet</span>}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}