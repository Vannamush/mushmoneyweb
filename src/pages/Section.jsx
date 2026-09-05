import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useExpenses, useCategories } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import ExpenseEditDialog from '@/components/ExpenseEditDialog';
import { Plus } from 'lucide-react';

export default function Section() {
  const [params] = useSearchParams();
  const name = params.get('name') || 'Section';
  const catParam = params.get('category') || '';
  const names = catParam.split('|').filter(Boolean);
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(null);

  const catMap = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const sectionCats = useMemo(() => categories.filter((c) => names.includes(c.name)), [categories, names]);
  const filtered = useMemo(
    () => expenses.filter((e) => names.includes(catMap[e.category_id]?.name)),
    [expenses, catMap, names]
  );

  const byCat = useMemo(() => {
    const map = {};
    filtered.forEach((e) => { (map[e.category_id] = map[e.category_id] || []).push(e); });
    return map;
  }, [filtered]);

  const total = filtered.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">{name}</h1>
          <p className="text-xs text-muted-foreground">{formatCurrency(total)} across {sectionCats.length} categories</p>
        </div>
        <button
          onClick={() => navigate('/add')}
          className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">No expenses in this section yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sectionCats.map((cat) => {
            const items = (byCat[cat.id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!items.length) return null;
            const catTotal = items.reduce((s, e) => s + Number(e.amount), 0);
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat.emoji} {cat.name}</h2>
                  <span className="text-xs text-muted-foreground">{formatCurrency(catTotal)}</span>
                </div>
                <div className="space-y-2">
                  {items.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setEditing(e)}
                      className="w-full text-left rounded-2xl bg-card border border-border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{e.note || cat.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="font-semibold">{formatCurrency(e.amount)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <ExpenseEditDialog expense={editing} categories={categories} onClose={() => setEditing(null)} />}
    </div>
  );
}