import React from 'react';
import { Image } from '@/components/ui/image';
import { prettyDate } from '@/lib/book';

export default function VisitHistory({ visits }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold p-4 pb-3">
        Visit history · {visits.length}
      </h2>
      {visits.length === 0 ? (
        <p className="px-4 pb-4 text-sm text-muted-foreground">No visits logged yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {visits.map((v) => (
            <div key={v.id} className="flex items-center gap-3 p-4">
              {v.photo_url ? (
                <Image src={v.photo_url} alt={v.service} className="h-14 w-14 rounded-md object-cover shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-md bg-muted shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{v.service}</p>
                {v.note && <p className="text-sm text-muted-foreground truncate">{v.note}</p>}
              </div>
              <span className="text-sm text-muted-foreground shrink-0">{prettyDate(v.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}