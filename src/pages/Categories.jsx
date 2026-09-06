import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Receipt } from 'lucide-react';
import { useCategories, useBills, useRefresh } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import CategoryRow from '@/components/CategoryRow';
import BillRow from '@/components/BillRow';
import TagBillRow from '@/components/TagBillRow';
import BillDialog from '@/components/BillDialog';

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#06b6d4', '#e11d48', '#84cc16'];
const EMOJIS = ['🏠', '🍔', '⛽', '🎉', '🧸', '📺', '🛒', '💊', '✈️', '☕', '👕', '💻', '🎁', '🚗', '🐾', '📚'];

export default function Categories() {
  const { data: categories = [] } = useCategories();
  const { data: bills = [] } = useBills();
  const refresh = useRefresh(['categories', 'bills']);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(null);
  const [billEditing, setBillEditing] = useState(null);
  const [billAdding, setBillAdding] = useState(false);

  const norm = (s) => (s || '').trim().toLowerCase();
  const topLevel = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const childrenOf = (parentId) => categories.filter((c) => c.parent_id === parentId);
  const groupNames = (parent) => [parent.name, ...childrenOf(parent.id).map((c) => c.name)];

  const otherBills = useMemo(() => {
    const allNames = topLevel.flatMap(groupNames).map(norm);
    const seen = new Set();
    return bills.filter((b) => {
      const key = norm(b.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return !allNames.includes(key);
    });
  }, [bills, topLevel]);

  const del = async (c) => {
    const subs = childrenOf(c.id);
    const msg = subs.length
      ? `Delete "${c.name}" and its ${subs.length} sub-tag(s)? Existing expenses keep their records.`
      : `Delete "${c.name}"? Existing expenses keep their records.`;
    if (!confirm(msg)) return;
    await Promise.all(subs.map((s) => base44.entities.Category.delete(s.id)));
    await base44.entities.Category.delete(c.id);
    refresh();
  };

  const delBill = async (b) => {
    if (!confirm(`Delete "${b.name}"?`)) return;
    await base44.entities.Bill.delete(b.id);
    refresh();
  };

  return (
    <div className="px-5 pt-6 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Tags & Bills</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setBillAdding(true)} className="h-10 px-3 rounded-full bg-muted text-foreground flex items-center gap-1.5 text-sm font-medium">
            <Receipt className="h-4 w-4" /> Bill
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {topLevel.map((c) => (
          <div key={c.id} className="space-y-2">
            <CategoryRow category={c} onAddSub={(parent) => setAdding({ parentId: parent.id })} onEdit={setEditing} onDelete={del} />
            {childrenOf(c.id).map((sub) => {
              const bill = bills.find((b) => norm(b.name) === norm(sub.name));
              if (bill) return <TagBillRow key={sub.id} category={sub} bill={bill} onEdit={setBillEditing} onDelete={delBill} />;
              return <CategoryRow key={sub.id} category={sub} depth={1} onEdit={setEditing} onDelete={del} />;
            })}
            {bills.filter((b) => norm(b.name) === norm(c.name)).map((b) => (
              <BillRow key={b.id} bill={b} onEdit={setBillEditing} onDelete={delBill} />
            ))}
          </div>
        ))}

        {otherBills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: '#f59e0b22' }}>
                🧾
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">Other bills</p>
                <p className="text-xs text-muted-foreground">{otherBills.length} bill{otherBills.length === 1 ? '' : 's'}</p>
              </div>
            </div>
            {otherBills.map((b) => (
              <BillRow key={b.id} bill={b} onEdit={setBillEditing} onDelete={delBill} />
            ))}
          </div>
        )}
      </div>

      {adding && (
        <CategoryDialog
          categories={categories}
          parentId={adding.parentId}
          onClose={() => setAdding(null)}
          onSaved={() => { setAdding(null); refresh(); }}
        />
      )}
      {editing && (
        <CategoryDialog
          category={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refresh(); }}
        />
      )}
      {(billAdding || billEditing) && (
        <BillDialog
          bill={billEditing}
          onClose={() => { setBillAdding(false); setBillEditing(null); }}
          onSaved={() => { setBillAdding(false); setBillEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

function CategoryDialog({ category, categories, parentId: initialParentId, onClose, onSaved }) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || '');
  const [emoji, setEmoji] = useState(category?.emoji || '💸');
  const [color, setColor] = useState(category?.color || COLORS[0]);
  const [budget, setBudget] = useState(category?.budget ? String(category.budget) : '');
  const [parentId, setParentId] = useState(category?.parent_id || initialParentId || '');
  const [saving, setSaving] = useState(false);

  const parentOptions = useMemo(
    () => categories.filter((c) => !c.parent_id && c.id !== category?.id),
    [categories, category]
  );
  const parent = categories.find((c) => c.id === parentId);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      emoji,
      color,
      budget: budget ? Number(budget) : 0,
      sort_order: category?.sort_order || 0,
      parent_id: parentId || null,
    };
    try {
      if (isEdit) await base44.entities.Category.update(category.id, payload);
      else await base44.entities.Category.create(payload);
      onSaved();
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit tag' : parent ? `New sub-tag under ${parent.name}` : 'New tag'}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '22' }}>
            {emoji}
          </div>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 h-12" autoFocus />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Parent tag (optional)</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setParentId('')}
              className={`h-9 px-3 rounded-full text-sm border ${!parentId ? 'border-primary bg-muted font-medium' : 'border-border'}`}
            >
              None
            </button>
            {parentOptions.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setParentId(p.id)}
                className={`h-9 px-3 rounded-full text-sm border flex items-center gap-1.5 ${parentId === p.id ? 'border-primary bg-muted font-medium' : 'border-border'}`}
              >
                <span>{p.emoji}</span>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Emoji</p>
          <div className="grid grid-cols-8 gap-2">
            {EMOJIS.map((em) => (
              <button key={em} type="button" onClick={() => setEmoji(em)} className={`h-9 rounded-lg text-lg ${emoji === em ? 'bg-muted ring-2 ring-primary' : 'bg-muted'}`}>
                {em}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Color</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((col) => (
              <button key={col} type="button" onClick={() => setColor(col)} className={`h-8 w-8 rounded-full ${color === col ? 'ring-2 ring-offset-2 ring-foreground' : ''}`} style={{ backgroundColor: col }} />
            ))}
          </div>
        </div>

        <Input type="number" placeholder="Monthly budget (optional)" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-12" />

        <DialogFooter>
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}