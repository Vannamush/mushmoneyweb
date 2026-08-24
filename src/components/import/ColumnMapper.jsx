import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FIELDS = [
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
];

export default function ColumnMapper({ headers, columns, onChange }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <h2 className="text-sm font-medium">Match your columns</h2>
      {FIELDS.map((f) => (
        <div key={f.key} className="flex items-center gap-3">
          <span className="text-sm w-24 shrink-0">{f.label}</span>
          <Select value={columns[f.key] || ''} onValueChange={(v) => onChange({ ...columns, [f.key]: v })}>
            <SelectTrigger className="h-10 flex-1">
              <SelectValue placeholder="Choose column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((h, i) => (
                <SelectItem key={`${h}-${i}`} value={h}>
                  {h || `Column ${i + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}