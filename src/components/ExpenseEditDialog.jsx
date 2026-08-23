import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CategoryPicker from '@/components/CategoryPicker';
import { useRefresh } from '@/lib/api';

export default function ExpenseEditDialog({ expense, categories, onClose }) {
  const refresh = useRefresh(['expenses']);
  const [amount, setAmount] = useState(String(expense.amount));
  const [categoryId, setCategoryId] = useState(expense.category_id);
  const [note, setNote] = useState(expense.note || '');
  const [date, setDate] = useState(expense.date);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await base44.entities.Expense.update(expense.id, {
        amount: parseFloat(amount) || 0,
        category_id: categoryId,
        note: note.trim(),
        date,
      });
      refresh();
      onClose();
    } catch (e) {
      setBusy(false);
    }
  };

  const del = async () => {
    if (!confirm('Delete this expense?')) return;
    setBusy(true);
    try {
      await base44.entities.Expense.delete(expense.id);
      refresh();
      onClose();
    } catch (e) {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit expense</DialogTitle>
        </DialogHeader>
        <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 text-lg" />
        <CategoryPicker categories={categories} value={categoryId} onChange={setCategoryId} />
        <Input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} className="h-12" />
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12" />
        <DialogFooter className="flex gap-2">
          <Button variant="destructive" onClick={del} disabled={busy}>
            Delete
          </Button>
          <Button onClick={save} disabled={busy}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}