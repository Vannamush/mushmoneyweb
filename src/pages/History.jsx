import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useExpenses, useCategories } from '@/lib/api';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import ExpenseRow from '@/components/ExpenseRow';
import ExpenseEditDialog from '@/components/ExpenseEditDialog';
import { monthKey, formatCurrency } from '@/lib/money';

export default function History() {
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const [searchParams] = useSearchParams();
  const [monthFilter, setMonthFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const name = searchParams.get('category');
    if (!name) return;
    const names = name.split(',');
    const ids = categories.filter((c) => names.includes(c.name)).map((c) => c.id);
    if (ids.length) setCatFilter(ids.join(','));
  }, [searchParams, categories]);

  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => monthKey(new Date(e.date))));
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  const filtered = useMemo(
    () =>
      expenses.filter((e) => {
        if (catFilter !== 'all' && !catFilter.split(',').includes(e.category_id)) return false;
        if (monthFilter !== 'all' && monthKey(new Date(e.date)) !== monthFilter) return false;
        return true;
      }),
    [expenses, catFilter, monthFilter]
  );

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const key = new Date(e.date).toISOString().slice(0, 10);
      (map[key] = map[key] || []).push(e);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="px-5 pt-6">
      <h1 className="text-xl font-semibold mb-4">History</h1>

      <div className="flex gap-2 mb-4">
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {new Date(m + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No expenses match your filters</p>
      ) : (
        grouped.map(([day, items]) => {
          const total = items.reduce((s, e) => s + Number(e.amount), 0);
          return (
            <div key={day} className="mb-5">
              <div className="flex justify-between items-center mb-1 px-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-xs text-muted-foreground">{formatCurrency(total)}</p>
              </div>
              <div className="rounded-2xl bg-card border border-border px-2 divide-y divide-border">
                {items.map((e) => (
                  <ExpenseRow key={e.id} expense={e} category={catMap[e.category_id]} onClick={() => setEditing(e)} />
                ))}
              </div>
            </div>
          );
        })
      )}

      {editing && <ExpenseEditDialog expense={editing} categories={categories} onClose={() => setEditing(null)} />}
    </div>
  );
}