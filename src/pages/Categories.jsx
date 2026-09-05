import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { useCategories, useRefresh } from '@/lib/api';
import { formatCurrency } from '@/lib/money';

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#06b6d4', '#e11d48', '#84cc16'];
const EMOJIS = ['🏠', '🍔', '⛽', '🎉', '🧸', '📺', '🛒', '💊', '✈️', '☕', '👕', '💻', '🎁', '🚗', '🐾', '📚'];

export default function Categories() {
  const { data: categories = [] } = useCategories();
  const refresh = useRefresh(['categories']);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const del = async (c) => {
    if (!confirm(`Delete "${c.name}"? Existing expenses keep their records.`)) return;
    await base44.entities.Category.delete(c.id);
    refresh();
  };

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Categories</h1>
        <button onClick={() => setAdding(true)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <button
        onClick={() => navigate('/add')}
        className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 text-primary py-3 mb-4 font-medium hover:bg-muted transition"
      >
        <Plus className="h-5 w-5" /> Add expense
      </button>

      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border p-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: c.color + '22' }}>
              {c.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.budget ? formatCurrency(c.budget) + '/mo' : 'No budget'}</p>
            </div>
            <button onClick={() => setEditing(c)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Pencil className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => del(c)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {(adding || editing) && (
        <CategoryDialog category={editing} onClose={() => { setAdding(false); setEditing(null); }} onSaved={() => { setAdding(false); setEditing(null); refresh(); }} />
      )}
    </div>
  );
}

function CategoryDialog({ category, onClose, onSaved }) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name || '');
  const [emoji, setEmoji] = useState(category?.emoji || '💸');
  const [color, setColor] = useState(category?.color || COLORS[0]);
  const [budget, setBudget] = useState(category?.budget ? String(category.budget) : '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      emoji,
      color,
      budget: budget ? Number(budget) : 0,
      sort_order: category?.sort_order || 0,
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
          <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: color + '22' }}>
            {emoji}
          </div>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 h-12" />
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