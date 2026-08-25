import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronRight } from 'lucide-react';
import ClientAvatar from './ClientAvatar';
import { STALE_DAYS } from '@/lib/book';

export default function StaleList({ clients }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4 text-brand" />
        <h2 className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Haven't been in a while</h2>
      </div>
      <div className="rounded-lg border border-brand/30 bg-brand/5 overflow-hidden">
        {clients.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">Everyone's been in within {STALE_DAYS} days. Nice.</p>
        ) : (
          <div className="divide-y divide-brand/15">
            {clients.map((c) => (
              <Link key={c.id} to={`/book/client/${c.id}`} className="flex items-center gap-3 p-3 active:bg-brand/10">
                <ClientAvatar name={c.name} photoUrl={c.lastPhoto} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.style || 'No style on file'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-2xl leading-none text-brand">{c.days}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">days</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}