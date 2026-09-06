import React from 'react';
import { Trash2, Pencil, Plus, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/money';

export default function CategoryRow({ category, depth = 0, onAddSub, onEdit, onDelete, onPay, paying }) {
  const isSub = depth > 0;
  return (
    <div
      className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3"
      style={{ marginLeft: depth * 20 }}
    >
      <div className="h-10 w-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: category.color + '22' }}>
        {category.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isSub ? 'text-sm text-muted-foreground' : ''}`}>{category.name}</p>
        <p className="text-xs text-muted-foreground">{category.budget ? formatCurrency(category.budget) + '/mo' : 'No budget'}</p>
      </div>
      {!isSub && onAddSub && (
        <button onClick={() => onAddSub(category)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0" title="Add sub-tag">
          <Plus className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      {isSub && category.budget > 0 && onPay && (
        <button onClick={() => onPay(category)} disabled={paying} className="h-9 px-3 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 shrink-0 disabled:opacity-60">
          <CreditCard className="h-3.5 w-3.5" />
          {paying ? '…' : 'Pay'}
        </button>
      )}
      <button onClick={() => onEdit(category)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Pencil className="h-4 w-4 text-muted-foreground" />
      </button>
      <button onClick={() => onDelete(category)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Trash2 className="h-4 w-4 text-red-500" />
      </button>
    </div>
  );
}