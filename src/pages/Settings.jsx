import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Check, Sparkles, FileUp, Trash2, Download } from 'lucide-react';
import { useSettings, useRefresh } from '@/lib/api';
import { useTheme } from '@/lib/theme';
import { setCurrency } from '@/lib/money';
import BottomSheetSelect from '@/components/BottomSheetSelect';
import ProPlans from '@/components/ProPlans';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'SEK', name: 'Swedish Krona' },
  { code: 'NOK', name: 'Norwegian Krone' },
  { code: 'DKK', name: 'Danish Krone' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'TRY', name: 'Turkish Lira' },
  { code: 'ILS', name: 'Israeli Shekel' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'THB', name: 'Thai Baht' },
  { code: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'PHP', name: 'Philippine Peso' },
  { code: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'VND', name: 'Vietnamese Dong' },
  { code: 'EGP', name: 'Egyptian Pound' },
  { code: 'MAD', name: 'Moroccan Dirham' },
  { code: 'TND', name: 'Tunisian Dinar' },
  { code: 'XOF', name: 'West African CFA Franc' },
  { code: 'XAF', name: 'Central African CFA Franc' },
].map((c) => ({ value: c.code, label: `${c.code} · ${c.name}` }));

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
  const [currency, setCurrencyState] = useState(settings?.currency || 'USD');
  const [name, setName] = useState(settings?.display_name || '');
  const [weekStart, setWeekStart] = useState(settings?.week_start || 'sunday');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  const changeCurrency = async (code) => {
    setCurrencyState(code);
    setCurrency(code);
    if (settings?.id) await base44.entities.Settings.update(settings.id, { currency: code });
    refresh();
  };

  const changeWeekStart = async (val) => {
    setWeekStart(val);
    if (settings?.id) await base44.entities.Settings.update(settings.id, { week_start: val });
    refresh();
  };

  const saveName = async () => {
    setSaving(true);
    try {
      if (settings?.id) await base44.entities.Settings.update(settings.id, { display_name: name.trim() });
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const [expenses, incomes, categories] = await Promise.all([
        base44.entities.Expense.list('-date', 5000),
        base44.entities.Income.list('-date', 5000),
        base44.entities.Category.list('sort_order', 500),
      ]);
      const catName = (id) => categories.find((c) => c.id === id)?.name || '';
      const rows = [['type', 'date', 'amount', 'category', 'note']];
      expenses.forEach((e) => rows.push(['expense', e.date, e.amount, catName(e.category_id), e.note || '']));
      incomes.forEach((i) => rows.push(['income', i.date, i.amount, i.source || '', i.note || '']));
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mushmoney-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
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
        <h2 className="text-sm font-medium mb-3">Profile name</h2>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-12 text-base" />
          <Button onClick={saveName} disabled={saving} className="h-12 px-6">
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Shown in the sidebar and across the app.</p>
      </div>

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

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">Currency</h2>
        <BottomSheetSelect
          value={currency}
          onChange={changeCurrency}
          placeholder="Choose currency"
          options={CURRENCIES}
          triggerClassName="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground mt-2">Amounts across the app are shown in this currency.</p>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-medium mb-3">Week starts on</h2>
        <BottomSheetSelect
          value={weekStart}
          onChange={changeWeekStart}
          placeholder="Choose start day"
          options={[
            { value: 'sunday', label: 'Sunday' },
            { value: 'monday', label: 'Monday' },
          ]}
          triggerClassName="h-12 text-base"
        />
        <p className="text-xs text-muted-foreground mt-2">Used when grouping History by week.</p>
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
          onClick={exportData}
          disabled={exporting}
          className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left mb-3 disabled:opacity-50"
        >
          <Download className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{exporting ? 'Preparing…' : 'Export data'}</p>
            <p className="text-xs text-muted-foreground">Download all expenses and income as a CSV</p>
          </div>
        </button>
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