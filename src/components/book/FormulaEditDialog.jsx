import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBookRefresh } from '@/lib/bookApi';

const FIELDS = [
  { key: 'name', label: 'Full name' },
  { key: 'phone', label: 'Phone' },
  { key: 'style', label: 'Current style' },
  { key: 'pattern', label: 'Pattern / part size' },
  { key: 'hair_type', label: 'Hair type used' },
  { key: 'retwist_schedule', label: 'Retwist schedule' },
  { key: 'style_duration', label: 'Time to install' },
];

export default function FormulaEditDialog({ open, onOpenChange, client }) {
  const refresh = useBookRefresh();
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.key, client[f.key] || ''])));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Client.update(client.id, form);
      refresh();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-theme="clientbook" className="max-w-sm bg-background font-body max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider">Edit The Formula</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
              <Input
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
          ))}
          <Button onClick={save} disabled={saving} className="w-full h-12">
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}