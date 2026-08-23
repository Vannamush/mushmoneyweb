import React from 'react';
import { formatCurrencyExact } from '@/lib/money';

export default function ExpenseRow({ expense, category, onClick, showDate = false }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left active:bg-muted rounded-xl px-2 transition">
      <div
        className="h-10 w-10 rounded-full flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: category ? category.color + '22' : 'hsl(var(--muted))' }}
      >
        {category ? category.emoji : '💸'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{category ? category.name : 'Uncategorized'}</div>
        {expense.note && <div className="text-xs text-muted-foreground truncate">{expense.note}</div>}
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold">{formatCurrencyExact(expense.amount)}</div>
        {showDate && <div className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
      </div>
    </button>
  );
}