import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBookRefresh } from '@/lib/bookApi';

export default function NewClientDialog({ open, onOpenChange }) {
  const navigate = useNavigate();
  const refresh = useBookRefresh();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      const client = await base44.entities.Client.create({ name: name.trim(), phone: phone.trim() });
      refresh();
      setName('');
      setPhone('');
      onOpenChange(false);
      navigate(`/book/client/${client.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-theme="clientbook" className="max-w-sm bg-background font-body">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider">New Client</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">Name and number is enough. Fill in the rest later.</p>
        <div className="space-y-3">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="h-14 text-lg" />
          <Input placeholder="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-14 text-lg" />
          <Button onClick={save} disabled={saving || !name.trim() || !phone.trim()} className="w-full h-14 text-base">
            {saving ? 'Saving…' : 'Add client'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}