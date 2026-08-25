import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useBookRefresh } from '@/lib/bookApi';

export default function NotesSection({ client }) {
  const refresh = useBookRefresh();
  const [editing, setEditing] = useState(false);
  const [prefs, setPrefs] = useState(client.preferences || '');
  const [personal, setPersonal] = useState(client.personal_notes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Client.update(client.id, { preferences: prefs, personal_notes: personal });
      refresh();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Notes</h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-brand flex items-center gap-1 text-sm font-medium">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Preferences & sensitivities</label>
            <Textarea value={prefs} onChange={(e) => setPrefs(e.target.value)} rows={3} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Personal notes</label>
            <Textarea value={personal} onChange={(e) => setPersonal(e.target.value)} rows={3} className="mt-1" />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="flex-1 h-11">Save</Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="h-11">Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Block label="Preferences & sensitivities" text={client.preferences} />
          <Block label="Personal notes" text={client.personal_notes} />
        </div>
      )}
    </div>
  );
}

function Block({ label, text }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="text-base mt-0.5 whitespace-pre-line">{text || <span className="text-muted-foreground/60">Nothing noted</span>}</p>
    </div>
  );
}