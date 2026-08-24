import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
          <Select value={row.category_id || ''} onValueChange={(v) => onCategory(row.key, v)}>
            <SelectTrigger className="h-8 mt-2 text-xs">
              <SelectValue placeholder="Pick a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <span className="text-sm font-medium shrink-0">{formatCurrencyExact(row.amount)}</span>
    </div>
  );
}