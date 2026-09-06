import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, Sparkles, FileUp, Trash2 } from 'lucide-react';
import { useSettings, useRefresh } from '@/lib/api';
import { useTheme } from '@/lib/theme';
import ProPlans from '@/components/ProPlans';

const THEMES = [
  { id: 'minimal', name: 'Clean & Minimal', desc: 'Airy and light', preview: 'bg-white border border-border' },
  { id: 'dark', name: 'Dark Mode', desc: 'Sleek and efficient', preview: 'bg-neutral-900' },
  { id: 'playful', name: 'Colorful & Playful', desc: 'Vibrant and fun', preview: 'bg-amber-100' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const refresh = useRefresh(['settings']);
  const { theme, setTheme } = useTheme();
  const [budget, setBudget] = useState(settings ? String(settings.budget) : '6000');
  const [saving, setSaving] = useState(false);

  const isPro = settings?.subscription_status === 'active';
  const justPaid = new URLSearchParams(window.location.search).get('payment') === 'success';

  const saveBudget = async () => {
    setSaving(true);
    try {
      if (settings?.id) await base44.entities.Settings.update(settings.id, { budget: Number(budget) || 6000 });
      refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="h-11 w-11 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      {justPaid && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
          Thanks for upgrading! Your Pro status will activate shortly.
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">Mushmoney Pro</h2>
        {isPro ? (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-medium text-emerald-800">Pro is active</p>
              <p className="text-xs text-emerald-700">Thanks for supporting Mushmoney!</p>
            </div>
          </div>
        ) : (
          <ProPlans />
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">Bank import</h2>
        <button
          onClick={() => navigate('/import')}
          className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left"
        >
          <FileUp className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Import a CSV</p>
            <p className="text-xs text-muted-foreground">Upload a bank export and auto-categorize it</p>
          </div>
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">Monthly budget</h2>
        <div className="flex gap-2">
          <Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="h-12 text-lg" />
          <Button onClick={saveBudget} disabled={saving} className="h-12 px-6">
            Save
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium mb-3">Theme</h2>
        <div className="space-y-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`w-full flex items-center gap-3 rounded-2xl border-2 p-3 transition ${theme === t.id ? 'border-primary' : 'border-border bg-card'}`}
            >
              <div className={`h-10 w-10 rounded-full ${t.preview}`} />
              <div className="flex-1 text-left">
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              {theme === t.id && <Check className="h-5 w-5 text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 pb-10">
        <h2 className="text-sm font-medium mb-3">Account</h2>
        <button
          onClick={async () => {
            if (!confirm('Delete your account? This permanently removes your data and logs you out. This cannot be undone.')) return;
            try {
              await base44.functions.invoke('deleteAccount', {});
            } catch (e) {
              // continue to logout even if cleanup fails
            }
            try {
              await base44.auth.logout();
            } catch (e) {
              await base44.auth.logout();
            }
          }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 p-4 text-red-600 font-medium no-select"
        >
          <Trash2 className="h-5 w-5" />
          Delete account
        </button>
      </div>
    </div>
  );
}