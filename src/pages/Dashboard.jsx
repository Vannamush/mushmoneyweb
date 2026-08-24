import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { useExpenses, useCategories, useSettings, useIncomes } from '@/lib/api';
import { formatCurrency, formatCurrencyExact, daysLeftInMonth, isSameMonth } from '@/lib/money';
import ProgressBar from '@/components/ProgressBar';
import DonutChart from '@/components/DonutChart';
import ExpenseRow from '@/components/ExpenseRow';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const { data: settings } = useSettings();
  const { data: incomes = [] } = useIncomes();
  const budget = settings?.budget ?? 6000;

  const monthIncomes = useMemo(() => incomes.filter((i) => isSameMonth(i.date)), [incomes]);
  const totalIncome = monthIncomes.reduce((s, i) => s + Number(i.amount), 0);
  const net = totalIncome - totalSpent;

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);

  const monthExpenses = useMemo(() => expenses.filter((e) => isSameMonth(e.date)), [expenses]);
  const totalSpent = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const remaining = budget - totalSpent;
  const safeToSpend = Math.max(0, remaining) / daysLeftInMonth();

  const byCategory = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => {
      map[e.category_id] = (map[e.category_id] || 0) + Number(e.amount);
    });
    return Object.entries(map)
      .map(([id, value]) => ({ id, value, cat: catMap[id] }))
      .filter((d) => d.cat)
      .sort((a, b) => b.value - a.value);
  }, [monthExpenses, catMap]);

  const donutData = byCategory.map((d) => ({ value: d.value, color: d.cat.color }));

  const top5 = useMemo(
    () => [...monthExpenses].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5),
    [monthExpenses]
  );

  const warnings = byCategory.filter((d) => d.cat.budget && d.value > d.cat.budget);
  const pct = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <h1 className="text-xl font-semibold">Mushmoney</h1>
        </div>
        <button onClick={() => navigate('/settings')} className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <div className="text-center mb-5">
        <p className="text-sm text-muted-foreground mb-1">Spent this month</p>
        <p className="text-5xl font-bold tracking-tight">{formatCurrency(totalSpent)}</p>
        <p className="text-sm text-muted-foreground mt-1">of {formatCurrency(budget)} budget</p>
      </div>

      <div className="flex items-stretch gap-2 mb-5">
        <div className="flex-1 rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="font-semibold text-emerald-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="flex-1 rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={`font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(net)}</p>
        </div>
        <button onClick={() => navigate('/add-income')} className="rounded-xl bg-muted px-3 flex flex-col items-center justify-center gap-0.5">
          <Plus className="h-5 w-5" />
          <span className="text-[10px] text-muted-foreground">Income</span>
        </button>
      </div>

      <ProgressBar value={totalSpent} max={budget} />
      <div className="flex justify-between text-xs text-muted-foreground mt-2 mb-6">
        <span>{Math.round(pct)}% used</span>
        <span className={remaining < 0 ? 'text-red-500 font-medium' : ''}>{formatCurrency(remaining)} left</span>
      </div>

      <div className="rounded-2xl bg-primary text-primary-foreground p-5 mb-6">
        <div className="flex items-center gap-2 opacity-80 text-sm mb-1">
          <TrendingUp className="h-4 w-4" /> Safe to spend today
        </div>
        <p className="text-3xl font-bold">{formatCurrency(safeToSpend)}</p>
        <p className="text-xs opacity-70 mt-1">{daysLeftInMonth()} days left in the month</p>
      </div>

      {warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {warnings.map((w) => (
            <div key={w.id} className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-amber-800 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {w.cat.emoji} {w.cat.name} is over its {formatCurrency(w.cat.budget)} budget ({formatCurrency(w.value)} spent)
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border p-5 mb-6">
        <h2 className="text-sm font-medium mb-3">By category</h2>
        <div className="flex flex-col items-center gap-4">
          <DonutChart data={donutData} centerTop={formatCurrency(totalSpent)} centerLabel="spent" />
          <div className="w-full space-y-2">
            {byCategory.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: d.cat.color }} />
                <span className="flex-1">
                  {d.cat.emoji} {d.cat.name}
                </span>
                <span className="font-medium">{formatCurrencyExact(d.value)}</span>
              </div>
            ))}
            {byCategory.length === 0 && <p className="text-sm text-muted-foreground text-center">No expenses yet this month</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5">
        <h2 className="text-sm font-medium mb-1">Biggest expenses</h2>
        {top5.length > 0 ? (
          <div className="divide-y divide-border">
            {top5.map((e) => (
              <ExpenseRow key={e.id} expense={e} category={catMap[e.category_id]} onClick={() => navigate('/history')} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4 text-center">Nothing yet — tap + to add an expense</p>
        )}
      </div>
    </div>
  );
}