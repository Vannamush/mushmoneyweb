import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function BillDialog({ bill, onClose, onSaved }) {
  const isEdit = !!bill;
  const [name, setName] = useState(bill?.name || '');
  const [amount, setAmount] = useState(bill?.amount ? String(bill.amount) : '');
  const [interval, setInterval] = useState(bill?.interval || 'month');
  const [note, setNote] = useState(bill?.note || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !(parseFloat(amount) > 0)) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      amount: parseFloat(amount),
      interval,
      note: note.trim(),
    };
    try {
      if (isEdit) await base44.entities.Bill.update(bill.id, payload);
      else await base44.entities.Bill.create(payload);
      onSaved();
    } catch (e) {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit bill' : 'New bill'}</DialogTitle>
        </DialogHeader>

        <Input placeholder="Name (e.g. Mortgage)" value={name} onChange={(e) => setName(e.target.value)} className="h-12" autoFocus />
        <Input type="number" inputMode="decimal" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12" />

        <div>
          <p className="text-xs text-muted-foreground mb-2">Charge cycle</p>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: 'month', label: 'Monthly' }, { id: 'year', label: 'Yearly' }].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setInterval(o.id)}
                className={`h-11 rounded-xl border-2 text-sm transition ${interval === o.id ? 'border-primary bg-muted' : 'border-border'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <Input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="h-12" />

        <DialogFooter>
          <Button onClick={save} disabled={saving} className="w-full">
            {saving ? 'Saving…' : 'Save bill'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}