import React from 'react';
import BottomSheetSelect from '@/components/BottomSheetSelect';

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
          <BottomSheetSelect
            value={columns[f.key] || ''}
            onChange={(v) => onChange({ ...columns, [f.key]: v })}
            placeholder="Choose column"
            options={headers.map((h, i) => ({ value: h, label: h || `Column ${i + 1}` }))}
            triggerClassName="h-10 flex-1"
          />
        </div>
      ))}
    </div>
  );
}