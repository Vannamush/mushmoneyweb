import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Receipt } from 'lucide-react';
import { useBills, useCategories, useRefresh } from '@/lib/api';
import SelectorHeader from '@/components/SelectorHeader';
import BillRow from '@/components/BillRow';

export default function Bills() {
  const [params] = useSearchParams();
  const groupFilter = params.get('group');
  const { data: bills = [] } = useBills();
  const { data: categories = [] } = useCategories();
  const refresh = useRefresh(['bills']);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState('');

  const groups = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_id);
    return parents.map((p) => ({
      key: p.id,
      short: p.name,
      names: [p.name, ...categories.filter((c) => c.parent_id === p.id).map((c) => c.name)],
    }));
  }, [categories]);

  const { grouped, other } = useMemo(() => {
    const map = {};
    const other = [];
    const seen = new Set();
    bills.forEach((b) => {
      if (seen.has(b.name)) return;
      seen.add(b.name);
      const g = groups.find((grp) => grp.names.includes(b.name));
      if (g) (map[g.key] = map[g.key] || []).push(b);
      else other.push(b);
    });
    return { grouped: map, other };
  }, [bills, groups]);

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

  const groupsToShow = groupFilter ? groups.filter((g) => g.key === groupFilter || g.short === groupFilter) : groups;

  const renderGroup = (key, title, items) => (
    <SelectorHeader key={key} icon={Receipt} title={title}>
      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-[#7a7c81]">No bills here yet.</div>
      ) : (
        items.map((b, i) => (
          <BillRow key={b.id} bill={b} index={i} paying={paying} onPay={pay} onEdit={setEditing} onDelete={del} />
        ))
      )}
    </SelectorHeader>
  );

  return (
    <div className="px-5 pt-6 pb-10 min-h-screen bg-[#0c111d] text-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-white">Bills</h1>
        <button onClick={() => setAdding(true)} className="h-10 w-10 rounded-full bg-[#22252d] text-white flex items-center justify-center">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {error && <p className="text-sm text-red-500 mb-3 text-center">{error}</p>}

      {groupsToShow.map((g) => renderGroup(g.key, g.short, grouped[g.key] || []))}
      {!groupFilter && renderGroup('other', 'Other bills', other)}

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