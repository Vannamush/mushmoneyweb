import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Camera, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NewClientDialog from '@/components/book/NewClientDialog';
import { useClients, useBookRefresh } from '@/lib/bookApi';
import { todayISO } from '@/lib/book';

const QUICK = ['Retwist', 'Retwist + style', 'Knotless braids', 'Box braids', 'Cornrows', 'Starter locs', 'Loc detox', 'Style only'];

export default function AddVisit() {
  const navigate = useNavigate();
  const refresh = useBookRefresh();
  const { data: clients = [] } = useClients();
  const preset = useMemo(() => new URLSearchParams(window.location.search).get('client') || '', []);

  const [clientId, setClientId] = useState(preset);
  const [service, setService] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [error, setError] = useState('');

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } catch {
      setError("Couldn't upload that photo.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!clientId || !service.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Visit.create({ client_id: clientId, date, service: service.trim(), note: note.trim(), photo_url: photoUrl });
      await base44.entities.Client.update(clientId, { last_visit: date });
      refresh();
      navigate(`/book/client/${clientId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-3xl tracking-[0.12em]">Add Visit</h1>
      </div>

      <label className="block mb-5">
        {photoUrl ? (
          <Image src={photoUrl} alt="Visit" className="w-full h-56 rounded-lg object-cover" />
        ) : (
          <div className="w-full h-56 rounded-lg border-2 border-dashed border-input bg-card flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Camera className="h-8 w-8" />
            <p className="font-medium">{uploading ? 'Uploading…' : 'Take or upload a photo'}</p>
          </div>
        )}
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      </label>

      {error && <p className="text-sm text-brand mb-3">{error}</p>}

      <div className="space-y-4">
        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Client</label>
          <div className="flex gap-2 mt-1">
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="h-14 text-base flex-1 bg-card">
                <SelectValue placeholder="Pick a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setNewOpen(true)} className="h-14 w-14 shrink-0">
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">What was done</label>
          <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g. Retwist + barrel twists" className="h-14 text-base mt-1 bg-card" />
          <div className="flex flex-wrap gap-2 mt-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setService(q)}
                className={`px-3 py-2 rounded-full text-sm border ${service === q ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border'}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Note (optional)</label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything to remember" className="h-14 text-base mt-1 bg-card" />
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-14 text-base mt-1 bg-card" />
        </div>

        <Button
          onClick={save}
          disabled={saving || !clientId || !service.trim()}
          className="w-full h-16 text-lg bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg"
        >
          {saving ? 'Saving…' : 'Save visit'}
        </Button>
      </div>

      <NewClientDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}