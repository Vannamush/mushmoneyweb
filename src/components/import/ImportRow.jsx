import React from 'react';
import BottomSheetSelect from '@/components/BottomSheetSelect';
import { formatCurrencyExact } from '@/lib/money';

export default function ImportRow({ row, categories, onToggle, onCategory }) {
  return (
    <div className={`flex items-start gap-3 py-3 ${row.duplicate ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={row.include}
        disabled={row.duplicate}
        onChange={(e) => onToggle(row.key, e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-current"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{row.note || '(no description)'}</p>
        <p className="text-xs text-muted-foreground">
          {row.date}
          {row.duplicate && ' · already imported'}
          {!row.duplicate && row.isCredit && ' · looks like income'}
        </p>
        {!row.duplicate && (
          <BottomSheetSelect
            value={row.category_id || ''}
            onChange={(v) => onCategory(row.key, v)}
            placeholder="Pick a category"
            options={categories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` }))}
            triggerClassName="h-8 mt-2 text-xs"
          />
        )}
      </div>
      <span className="text-sm font-medium shrink-0">{formatCurrencyExact(row.amount)}</span>
    </div>
  );
}