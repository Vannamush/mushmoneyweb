import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Pencil, Plus, CreditCard, Home } from 'lucide-react';
import { useBills, useRefresh } from '@/lib/api';
import { formatCurrency } from '@/lib/money';

export default function Bills() {
  const [params] = useSearchParams();
  const nameFilter = params.get('name');
  const { data: bills = [] } = useBills();
  const refresh = useRefresh(['bills']);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState('');

  const visible = nameFilter ? bills.filter((b) => b.name === nameFilter) : bills;

  const del = async (b) => {
    if (!confirm(`Delete "${b.name}"?`)) return;
    await base44.entities.Bill.delete(b.id);
    refresh();
  };

  const pay = async (b) => {
    if (window.self !== window.top) {
      alert('Checkout only works from the published app. Open the app in a new tab to pay.');
      return;
    }
    setError('');
    setPaying(b.id);
    try {
      const res = await base44.functions.invoke('createCheckout', {
        amount: b.amount,
        name: b.name,
        mode: 'subscription',
        interval: b.interval || 'month',
      });
      if (res.data?.url) {
        await base44.entities.Bill.update(b.id, { last_paid: new Date().toISOString().slice(0, 10) });
        refresh();
        window.location.href = res.data.url;
        return;
      }
      setError(res.data?.error || 'Could not start checkout. Try again.');
    } catch (e) {
      setError('Could not start checkout. Try again.');
    }
    setPaying(null);
  };

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Bills</h1>
          <p className="text-xs text-muted-foreground">Saved bills you charge to a card each cycle</p>
        </div>
        <button onClick={() => setAdding(true)} className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-3 text-center">{error}</p>}

      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <Home className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No bills yet. Add your mortgage or any recurring bill to charge it to a card.</p>
          </div>
        )}
        {visible.map((b) => (
          <div key={b.id} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{b.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(b.amount)} / {b.interval === 'year' ? 'year' : 'month'}
                  {b.last_paid ? ` · last charged ${b.last_paid}` : ''}
                </p>
              </div>
              <button onClick={() => setEditing(b)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
              <button onClick={() => del(b)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
            <Button onClick={() => pay(b)} disabled={paying === b.id} className="w-full mt-3" size="sm">
              <CreditCard className="h-4 w-4" />
              {paying === b.id ? 'Opening checkout…' : `Pay ${formatCurrency(b.amount)} by card`}
            </Button>
          </div>
        ))}
      </div>

      {(adding || editing) && (
        <BillDialog bill={editing} onClose={() => { setAdding(false); setEditing(null); }} onSaved={() => { setAdding(false); setEditing(null); refresh(); }} />
      )}
    </div>
  );
}

function BillDialog({ bill, onClose, onSaved }) {
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