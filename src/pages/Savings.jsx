import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, PiggyBank } from 'lucide-react';
import { useGoals, useRefresh } from '@/lib/api';
import { formatCurrencyExact } from '@/lib/money';
import GoalCard from '@/components/savings/GoalCard';
import GoalDialog from '@/components/savings/GoalDialog';
import AddFundsDialog from '@/components/savings/AddFundsDialog';

export default function Savings() {
  const { data: goals = [] } = useGoals();
  const refresh = useRefresh(['goals']);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [funding, setFunding] = useState(null);

  const del = async (g) => {
    if (!confirm(`Delete "${g.name}"?`)) return;
    await base44.entities.Goal.delete(g.id);
    refresh();
  };

  const totalSaved = goals.reduce((s, g) => s + (g.saved_amount || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + (g.target_amount || 0), 0);

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Savings goals</h1>
          <p className="text-xs text-muted-foreground">Set aside money for things you want to buy</p>
        </div>
        <button onClick={() => setAdding(true)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {goals.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-4 mb-4">
          <p className="text-xs text-muted-foreground">Total set aside</p>
          <p className="text-2xl font-semibold">{formatCurrencyExact(totalSaved)}</p>
          <p className="text-xs text-muted-foreground mt-1">of {formatCurrencyExact(totalTarget)} across {goals.length} {goals.length === 1 ? 'goal' : 'goals'}</p>
        </div>
      )}

      <div className="space-y-3">
        {goals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <PiggyBank className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No goals yet. Add something you're saving up for.</p>
          </div>
        )}
        {goals.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            onAddFunds={() => setFunding(g)}
            onEdit={() => setEditing(g)}
            onDelete={() => del(g)}
          />
        ))}
      </div>

      {adding && <GoalDialog onClose={() => setAdding(false)} onSaved={() => { setAdding(false); refresh(); }} />}
      {editing && <GoalDialog goal={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
      {funding && <AddFundsDialog goal={funding} onClose={() => setFunding(null)} onSaved={() => { setFunding(null); refresh(); }} />}
    </div>
  );
}