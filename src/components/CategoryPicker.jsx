import React from 'react';

export default function CategoryPicker({ categories, value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {categories.map((c) => {
        const selected = value === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl border-2 transition ${
              selected ? 'border-primary bg-muted' : 'border-transparent bg-muted'
            }`}
          >
            <span className="text-2xl">{c.emoji}</span>
            <span className="text-[11px] text-muted-foreground truncate w-full text-center">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}