import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SelectorHeader({ icon: Icon, title, pills = [], selectedKey, onSelect, action }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-[#111620] rounded-2xl mb-4 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-[#111620]" />
        </div>
        <h1 className="flex-1 text-lg font-semibold text-white">{title}</h1>
        {action}
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-9 w-9 flex items-center justify-center text-white"
          aria-label="Toggle filters"
        >
          <ChevronDown className={cn('h-5 w-5 transition-transform', open && 'rotate-180')} />
        </button>
      </div>
      {open && pills.length > 0 && (
        <div className="px-3 pb-3 space-y-1">
          {pills.map((p) => (
            <button
              key={p.key}
              onClick={() => onSelect?.(p.key)}
              className={cn(
                'w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium transition',
                selectedKey === p.key ? 'bg-[#f8f9fe] text-[#1a1d21]' : 'text-[#6c757d] hover:text-white'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}