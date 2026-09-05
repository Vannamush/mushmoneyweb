import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Pencil, Plus, Home, Receipt } from 'lucide-react';
import { useBills, useRefresh } from '@/lib/api';
import { formatCurrency } from '@/lib/money';
import SelectorHeader from '@/components/SelectorHeader';

const GROUPS = [
  { key: 'housing', label: 'Housing & Essential Utilities (Fixed/Needs)', short: 'Housing & Essentials', names: ['Rent', 'Mortgage', 'Property Taxes', 'HOA Fees', 'Electricity', 'Water', 'Gas', 'Trash', 'Internet', 'Home Maintenance', 'Car'] },
  { key: 'transportation', label: 'Transportation (Mixed)', short: 'Transportation', names: ['Auto Insurance', 'Auto Loan', 'Lease Payment', 'Fuel', 'EV Charging', 'Public Transit', 'Rideshare', 'Maintenance', 'Parking'] },
];

export default function Bills() {
  const [params, setParams] = useSearchParams();
  const nameFilter = params.get('name');
  const groupFilter = params.get('group');
  const { data: bills = [] } = useBills();
  const refresh = useRefresh(['bills']);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);

  const visible = bills.filter((b) => {
    if (nameFilter) return nameFilter.split('|').includes(b.name);
    if (groupFilter) {
      const g = GROUPS.find((grp) => grp.key === groupFilter);
      return g ? g.names.includes(b.name) : true;
    }
    return true;
  });

  const del = async (b) => {
    if (!confirm(`Delete "${b.name}"?`)) return;
    await base44.entities.Bill.delete(b.id);
    refresh();
  };

  return (
    <div className="px-5 pt-6 pb-10 min-h-screen bg-[#0c111d] text-white">
      <SelectorHeader
        icon={Receipt}
        title="Bills"
        pills={[{ key: 'all', label: 'All bills' }, ...GROUPS.map((g) => ({ key: g.key, label: g.short }))]}
        selectedKey={groupFilter || 'all'}
        onSelect={(key) => setParams(key === 'all' ? {} : { group: key })}
        action={
          <button onClick={() => setAdding(true)} className="h-9 w-9 rounded-full bg-white/10 text-white flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </button>
        }
      />

      <div className="space-y-4">
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#1b2336] p-8 text-center">
            <Home className="h-8 w-8 text-[#9ca3af] mx-auto mb-2" />
            <p className="text-sm text-[#9ca3af]">No bills yet. Add your mortgage or any recurring bill to track it here.</p>
          </div>
        )}
        {(() => {
          const grouped = {};
          const other = [];
          visible.forEach((b) => {
            const g = GROUPS.find((grp) => grp.names.includes(b.name));
            if (g) (grouped[g.label] = grouped[g.label] || []).push(b);
            else other.push(b);
          });
          const renderGroup = (label, items) => {
            if (!items.length) return null;
            const total = items.reduce((s, b) => s + Number(b.amount), 0);
            return (
              <div key={label} className="rounded-2xl bg-[#161e2e] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1b2336]">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">{label}</h2>
                  <span className="text-xs text-[#9ca3af]">{formatCurrency(total)}</span>
                </div>
                <div>
                  {items.map((b, i) => (
                    <div key={b.id} className={`px-4 py-3 flex items-center gap-3 ${i > 0 ? 'border-t border-[#1b2336]' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-white">{b.name}</p>
                        <p className="text-sm text-[#9ca3af]">
                          {formatCurrency(b.amount)} / {b.interval === 'year' ? 'year' : 'month'}
                          {b.last_paid ? ` · last charged ${b.last_paid}` : ''}
                        </p>
                      </div>
                      <button onClick={() => setEditing(b)} className="h-9 w-9 rounded-full bg-[#1b2336] flex items-center justify-center shrink-0">
                        <Pencil className="h-4 w-4 text-[#9ca3af]" />
                      </button>
                      <button onClick={() => del(b)} className="h-9 w-9 rounded-full bg-[#1b2336] flex items-center justify-center shrink-0">
                        <Trash2 className="h-4 w-4 text-[#ef4444]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          };
          return (
            <>
              {GROUPS.map((g) => renderGroup(g.label, grouped[g.label] || []))}
              {renderGroup('Other bills', other)}
            </>
          );
        })()}
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