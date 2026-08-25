import React, { useMemo } from 'react';
import { useClients, useVisits } from '@/lib/bookApi';
import { daysSince, isThisMonth, STALE_DAYS } from '@/lib/book';

export default function OwnerDashboard() {
  const { data: clients = [] } = useClients();
  const { data: visits = [] } = useVisits();

  const stats = useMemo(() => {
    const monthVisits = visits.filter((v) => isThisMonth(v.date));
    const lastByClient = {};
    visits.forEach((v) => {
      if (!lastByClient[v.client_id] || v.date > lastByClient[v.client_id]) lastByClient[v.client_id] = v.date;
    });
    const staleCount = clients.filter((c) => {
      const d = daysSince(lastByClient[c.id] || c.last_visit);
      return d !== null && d > STALE_DAYS;
    }).length;

    const counts = {};
    monthVisits.forEach((v) => {
      const key = (v.service || '').trim();
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

    return { total: clients.length, monthCount: monthVisits.length, staleCount, top };
  }, [clients, visits]);

  return (
    <div className="px-5 pt-5">
      <h1 className="font-display text-3xl tracking-[0.12em] mb-5">The Shop</h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="Total clients" value={stats.total} />
        <Stat label="Visits this month" value={stats.monthCount} />
      </div>

      <div className="rounded-lg border border-brand/30 bg-brand/5 p-4 mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Overdue clients</p>
        <p className="font-display text-5xl leading-none mt-2 text-brand">{stats.staleCount}</p>
        <p className="text-sm text-muted-foreground mt-1">Haven't been in for over {STALE_DAYS} days</p>
      </div>

      <div className="rounded-lg bg-primary text-primary-foreground p-4">
        <p className="text-xs uppercase tracking-[0.2em] opacity-60">Most popular service this month</p>
        {stats.top ? (
          <>
            <p className="font-display text-3xl tracking-wide mt-2">{stats.top[0]}</p>
            <p className="text-sm opacity-70">{stats.top[1]} visit{stats.top[1] === 1 ? '' : 's'}</p>
          </>
        ) : (
          <p className="text-base mt-2 opacity-60">No visits logged this month yet</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">{label}</p>
      <p className="font-display text-5xl leading-none mt-2">{value}</p>
    </div>
  );
}