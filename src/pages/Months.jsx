import React, { useMemo } from 'react';
import { useExpenses, useCategories, useSettings } from '@/lib/api';
import { formatCurrency, monthKey } from '@/lib/money';

export default function Months() {
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const budget = settings?.budget ?? 6000;
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  const months = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const k = monthKey(new Date(e.date));
      (map[k] = map[k] || []).push(e);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [expenses]);

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-semibold mb-4">Months</h1>
      {months.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No expenses yet</p>
      ) : (
        months.map(([key, items]) => {
          const total = items.reduce((s, e) => s + Number(e.amount), 0);
          const byCat = {};
          items.forEach((e) => {
            byCat[e.category_id] = (byCat[e.category_id] || 0) + Number(e.amount);
          });
          const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
          const topCat = top ? catMap[top[0]] : null;
          const over = total > budget;
          return (
            <div key={key} className="rounded-2xl bg-card border border-border p-4 mb-3">
              <p className="text-sm font-medium mb-3">
                {new Date(key + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(total)}</p>
                  <p className="text-xs text-muted-foreground">of {formatCurrency(budget)} budget</p>
                </div>
                <span className={`text-sm font-medium ${over ? 'text-red-500' : 'text-emerald-500'}`}>
                  {over ? 'Over budget' : formatCurrency(budget - total) + ' left'}
                </span>
              </div>
              {topCat && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-3">
                  <span>
                    Top: {topCat.emoji} {topCat.name}
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(top[1])}</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}