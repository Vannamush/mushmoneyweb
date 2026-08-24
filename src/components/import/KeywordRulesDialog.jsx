import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
import { useKeywordRules, useRefresh } from '@/lib/api';

export default function KeywordRulesDialog({ open, onOpenChange, categories }) {
  const { data: rules = [] } = useKeywordRules();
  const refresh = useRefresh(['keywordRules']);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!keyword.trim() || !categoryId) return;
    setBusy(true);
    try {
      await base44.entities.KeywordRule.create({ keyword: keyword.trim(), category_id: categoryId });
      setKeyword('');
      setCategoryId('');
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.KeywordRule.delete(id);
    refresh();
  };

  const catName = (id) => {
    const c = categories.find((x) => x.id === id);
    return c ? `${c.emoji} ${c.name}` : '—';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyword rules</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground">
          If a transaction description contains your keyword, it gets that category. Your rules override the built-in ones.
        </p>

        <div className="space-y-2">
          <Input placeholder="Keyword (e.g. TARGET)" value={keyword} onChange={(e) => setKeyword(e.target.value)} className="h-10" />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={add} disabled={busy || !keyword.trim() || !categoryId} className="w-full h-10">
            Add rule
          </Button>
        </div>

        <div className="max-h-56 overflow-y-auto divide-y divide-border">
          {rules.map((r) => (
            <div key={r.id} className="flex items-center gap-2 py-2 text-sm">
              <span className="flex-1 font-medium truncate">{r.keyword}</span>
              <span className="text-muted-foreground text-xs truncate">{catName(r.category_id)}</span>
              <button onClick={() => remove(r.id)} className="text-red-500 shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {rules.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">No custom rules yet</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}