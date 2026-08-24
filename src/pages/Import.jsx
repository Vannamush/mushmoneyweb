import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Upload, SlidersHorizontal } from 'lucide-react';
import { useCategories, useExpenses, useKeywordRules, useRefresh } from '@/lib/api';
import { parseCsv, parseAmount, parseDate, guessColumns } from '@/lib/csv';
import { buildDefaultRules, matchCategory, dupeKey } from '@/lib/importMatch';
import ColumnMapper from '@/components/import/ColumnMapper';
import ImportRow from '@/components/import/ImportRow';
import KeywordRulesDialog from '@/components/import/KeywordRulesDialog';

export default function Import() {
  const navigate = useNavigate();
  const { data: categories = [] } = useCategories();
  const { data: expenses = [] } = useExpenses();
  const { data: userRules = [] } = useKeywordRules();
  const refreshExpenses = useRefresh(['expenses']);

  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState(null); // { headers, rows }
  const [columns, setColumns] = useState({ date: '', description: '', amount: '' });
  const [overrides, setOverrides] = useState({}); // key -> { include, category_id }
  const [rulesOpen, setRulesOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  const defaultRules = useMemo(() => buildDefaultRules(categories), [categories]);
  const existingKeys = useMemo(
    () => new Set(expenses.map((e) => dupeKey(e.date, e.amount, e.note))),
    [expenses]
  );

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    setDone(null);
    setOverrides({});
    setFileName(file.name);
    const text = await file.text();
    const result = parseCsv(text);
    if (result.rows.length === 0) {
      setParsed(null);
      setError('That file has no rows we could read.');
      return;
    }
    setParsed(result);
    setColumns(guessColumns(result.headers));
  };

  const rows = useMemo(() => {
    if (!parsed || !columns.date || !columns.amount) return [];
    const idx = (name) => parsed.headers.indexOf(name);
    const di = idx(columns.date);
    const ni = idx(columns.description);
    const ai = idx(columns.amount);

    const raw = parsed.rows.map((r, i) => {
      const date = parseDate(r[di]);
      const rawAmount = parseAmount(r[ai]);
      const note = ni >= 0 ? r[ni] : '';
      return { i, date, rawAmount, note };
    });

    const hasNegatives = raw.some((r) => r.rawAmount < 0);

    return raw
      .filter((r) => r.date && !isNaN(r.rawAmount) && r.rawAmount !== 0)
      .map((r) => {
        const amount = Math.abs(r.rawAmount);
        const key = `${r.i}`;
        const isCredit = hasNegatives ? r.rawAmount > 0 : false;
        const duplicate = existingKeys.has(dupeKey(r.date, amount, r.note));
        const ov = overrides[key] || {};
        return {
          key,
          date: r.date,
          amount,
          note: r.note,
          isCredit,
          duplicate,
          include: ov.include !== undefined ? ov.include : !duplicate && !isCredit,
          category_id:
            ov.category_id !== undefined ? ov.category_id : matchCategory(r.note, userRules, defaultRules),
        };
      });
  }, [parsed, columns, existingKeys, overrides, userRules, defaultRules]);

  const setOverride = (key, patch) =>
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const selected = rows.filter((r) => r.include && !r.duplicate);
  const dupCount = rows.filter((r) => r.duplicate).length;
  const missingCategory = selected.filter((r) => !r.category_id).length;

  const runImport = async () => {
    setImporting(true);
    setError('');
    try {
      await base44.entities.Expense.bulkCreate(
        selected.map((r) => ({ amount: r.amount, category_id: r.category_id, note: r.note, date: r.date }))
      );
      refreshExpenses();
      setDone(selected.length);
      setParsed(null);
      setFileName('');
      setOverrides({});
    } catch (e) {
      setError('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => navigate(-1)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold flex-1">Import CSV</h1>
        <button onClick={() => setRulesOpen(true)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {done !== null && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
          Imported {done} transaction{done === 1 ? '' : 's'}.{' '}
          <button onClick={() => navigate('/history')} className="underline font-medium">
            View history
          </button>
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      <label className="block mb-6">
        <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center cursor-pointer">
          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">{fileName || 'Choose a CSV file'}</p>
          <p className="text-xs text-muted-foreground mt-1">From your bank or credit card export</p>
        </div>
        <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      </label>

      {parsed && (
        <div className="mb-6">
          <ColumnMapper headers={parsed.headers} columns={columns} onChange={setColumns} />
        </div>
      )}

      {parsed && rows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 mb-24">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-sm font-medium">Preview</h2>
            <span className="text-xs text-muted-foreground">
              {selected.length} selected{dupCount > 0 && ` · ${dupCount} duplicate${dupCount === 1 ? '' : 's'} skipped`}
            </span>
          </div>
          {missingCategory > 0 && (
            <p className="text-xs text-amber-600 mb-2">{missingCategory} need a category before importing</p>
          )}
          <div className="divide-y divide-border">
            {rows.map((r) => (
              <ImportRow
                key={r.key}
                row={r}
                categories={categories}
                onToggle={(key, include) => setOverride(key, { include })}
                onCategory={(key, category_id) => setOverride(key, { category_id })}
              />
            ))}
          </div>
        </div>
      )}

      {parsed && rows.length === 0 && (columns.date || columns.amount) && (
        <p className="text-sm text-muted-foreground">No usable rows — check the column matching above.</p>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-20 inset-x-0 max-w-md mx-auto px-5">
          <Button
            onClick={runImport}
            disabled={importing || missingCategory > 0}
            className="w-full h-12 shadow-lg"
          >
            {importing ? 'Importing…' : `Import ${selected.length} expense${selected.length === 1 ? '' : 's'}`}
          </Button>
        </div>
      )}

      <KeywordRulesDialog open={rulesOpen} onOpenChange={setRulesOpen} categories={categories} />
    </div>
  );
}