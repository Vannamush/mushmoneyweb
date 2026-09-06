import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useExpenses, useCategories, useSettings } from '@/lib/api';
import BottomSheetSelect from '@/components/BottomSheetSelect';
import PullToRefresh from '@/components/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import ExpenseRow from '@/components/ExpenseRow';
import ExpenseEditDialog from '@/components/ExpenseEditDialog';
import { monthKey, formatCurrency, weekKey } from '@/lib/money';
import { cn } from '@/lib/utils';

export default function History() {
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const budget = settings?.budget ?? 6000;
  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const [searchParams] = useSearchParams();
  const [monthFilter, setMonthFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('day');
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();
  const refresh = () => qc.refetchQueries({ type: 'active' });

  useEffect(() => {
    const name = searchParams.get('category');
    if (!name) return;
    const names = name.split('|');
    const ids = categories.filter((c) => names.includes(c.name)).map((c) => c.id);
    if (ids.length) setCatFilter(ids.join(','));
  }, [searchParams, categories]);

  const catFiltered = useMemo(
    () =>
      expenses.filter((e) => {
        if (catFilter !== 'all' && !catFilter.split('|').includes(e.category_id)) return false;
        return true;
      }),
    [expenses, catFilter]
  );

  const months = useMemo(() => {
    const map = {};
    catFiltered.forEach((e) => {
      const k = monthKey(new Date(e.date));
      (map[k] = map[k] || []).push(e);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [catFiltered]);

  const filtered = useMemo(
    () =>
      monthFilter === 'all' ? catFiltered : catFiltered.filter((e) => monthKey(new Date(e.date)) === monthFilter),
    [catFiltered, monthFilter]
  );

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((e) => {
      const d = new Date(e.date);
      const key = groupBy === 'week' ? weekKey(d, settings?.week_start) : d.toISOString().slice(0, 10);
      (map[key] = map[key] || []).push(e);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, groupBy, settings?.week_start]);

  return (
    <PullToRefresh onRefresh={refresh}>
    <div className="px-5 pt-6">
      <h1 className="text-xl font-semibold mb-4">History</h1>

      <div className="mb-4">
        <BottomSheetSelect
          value={catFilter}
          onChange={setCatFilter}
          placeholder="Category"
          options={[{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` }))]}
        />
      </div>

      <div className="flex gap-2 mb-4">
        {['day', 'week'].map((g) => (
          <button
            key={g}
            onClick={() => setGroupBy(g)}
            className={cn(
              'flex-1 rounded-xl border-2 py-2 text-sm font-medium capitalize transition',
              groupBy === g ? 'border-primary bg-muted' : 'border-border bg-card text-muted-foreground'
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {months.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">No expenses yet</p>
      ) : (
        <>
          <div className="space-y-2 mb-5">
            <button
              onClick={() => setMonthFilter('all')}
              className={cn(
                'w-full flex items-center justify-between rounded-2xl border-2 p-3 text-left transition',
                monthFilter === 'all' ? 'border-primary bg-muted' : 'border-border bg-card'
              )}
            >
              <span className="text-sm font-medium">All months</span>
              <span className="text-sm text-muted-foreground">{formatCurrency(catFiltered.reduce((s, e) => s + Number(e.amount), 0))}</span>
            </button>
            {months.map(([key, items]) => {
              const total = items.reduce((s, e) => s + Number(e.amount), 0);
              const byCat = {};
              items.forEach((e) => {
                byCat[e.category_id] = (byCat[e.category_id] || 0) + Number(e.amount);
              });
              const top = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
              const topCat = top ? catMap[top[0]] : null;
              const over = total > budget;
              const active = monthFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setMonthFilter(active ? 'all' : key)}
                  className={cn(
                    'w-full rounded-2xl border-2 p-3 text-left transition',
                    active ? 'border-primary bg-muted' : 'border-border bg-card'
                  )}
                >
                  <p className="text-sm font-medium mb-2">
                    {new Date(key + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xl font-bold">{formatCurrency(total)}</p>
                      <p className="text-xs text-muted-foreground">of {formatCurrency(budget)} budget</p>
                    </div>
                    <span className={cn('text-xs font-medium', over ? 'text-red-500' : 'text-emerald-500')}>
                      {over ? 'Over budget' : formatCurrency(budget - total) + ' left'}
                    </span>
                  </div>
                  {topCat && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-2">
                      <span>Top: {topCat.emoji} {topCat.name}</span>
                      <span className="font-medium text-foreground">{formatCurrency(top[1])}</span>
                    </div>
                  )}
                </button>
              );
            })}
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
                      {groupBy === 'week'
                        ? `Week of ${new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : new Date(day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
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
        </>
      )}

      {editing && <ExpenseEditDialog expense={editing} categories={categories} onClose={() => setEditing(null)} />}
    </div>
    </PullToRefresh>
  );
}