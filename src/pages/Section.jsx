import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useExpenses, useCategories, useRefresh } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import ExpenseEditDialog from '@/components/ExpenseEditDialog';
import SelectorHeader from '@/components/SelectorHeader';
import { Plus, Tag, Pencil, Trash2 } from 'lucide-react';

export default function Section() {
  const [params] = useSearchParams();
  const name = params.get('name') || 'Section';
  const catParam = params.get('category') || '';
  const names = catParam.split('|').filter(Boolean);
  const { data: expenses = [] } = useExpenses();
  const { data: categories = [] } = useCategories();
  const navigate = useNavigate();
  const refresh = useRefresh(['expenses']);
  const [editing, setEditing] = useState(null);
  const [selectedCat, setSelectedCat] = useState('all');

  const del = async (e) => {
    if (!confirm('Delete this expense?')) return;
    await base44.entities.Expense.delete(e.id);
    refresh();
  };

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
    <div className="px-5 pt-6 pb-10 min-h-screen bg-[#0c111d] text-white">
      <SelectorHeader
        icon={Tag}
        title={name}
        pills={[{ key: 'all', label: `All · ${formatCurrency(total)}` }, ...sectionCats.map((c) => ({ key: c.id, label: `${c.emoji} ${c.name}` }))]}
        selectedKey={selectedCat}
        onSelect={setSelectedCat}
        action={
          <button
            onClick={() => navigate('/add')}
            className="h-9 w-9 rounded-full bg-white/10 text-white flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1b2336] p-8 text-center">
          <p className="text-sm text-[#9ca3af]">No expenses in this section yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(selectedCat === 'all' ? sectionCats : sectionCats.filter((c) => c.id === selectedCat)).map((cat) => {
            const items = (byCat[cat.id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
            if (!items.length) return null;
            const catTotal = items.reduce((s, e) => s + Number(e.amount), 0);
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between px-1 mb-2">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">{cat.emoji} {cat.name}</h2>
                  <span className="text-xs text-[#9ca3af]">{formatCurrency(catTotal)}</span>
                </div>
                <div className="space-y-2">
                  {items.map((e) => (
                    <div key={e.id} className="rounded-2xl bg-[#161e2e] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-white">{e.note || cat.name}</p>
                          <p className="text-sm text-[#9ca3af]">
                            {formatCurrency(e.amount)} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <button onClick={() => setEditing(e)} className="h-9 w-9 rounded-full bg-[#1b2336] flex items-center justify-center shrink-0">
                          <Pencil className="h-4 w-4 text-[#9ca3af]" />
                        </button>
                        <button onClick={() => del(e)} className="h-9 w-9 rounded-full bg-[#1b2336] flex items-center justify-center shrink-0">
                          <Trash2 className="h-4 w-4 text-[#ef4444]" />
                        </button>
                      </div>
                    </div>
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