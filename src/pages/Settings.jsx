import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check } from 'lucide-react';
import { useSettings, useRefresh } from '@/lib/api';
import { useTheme } from '@/lib/theme';

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
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold">Settings</h1>
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
    </div>
  );
}