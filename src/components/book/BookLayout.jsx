import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Users, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SHOP_NAME, SHOP_TAGLINE } from '@/lib/book';

const items = [
  { to: '/book', label: 'Clients', icon: Users },
  { to: '/book/dashboard', label: 'Shop', icon: BarChart3 },
];

export default function BookLayout() {
  const { pathname } = useLocation();
  const isActive = (to) => (to === '/book' ? pathname === '/book' || pathname.startsWith('/book/client') : pathname === to);

  return (
    <div data-theme="clientbook" className="min-h-screen bg-background text-foreground font-body">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground border-b-4 border-brand">
        <div className="max-w-2xl mx-auto px-5 py-3 text-center">
          <h1 className="font-display text-3xl tracking-[0.18em] leading-none">{SHOP_NAME}</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70 mt-1">{SHOP_TAGLINE}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border">
        <div className="max-w-2xl mx-auto flex h-16">
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex-1 flex flex-col items-center justify-center gap-1">
              <Icon className={cn('h-5 w-5', isActive(to) ? 'text-brand' : 'text-muted-foreground')} strokeWidth={isActive(to) ? 2.5 : 2} />
              <span className={cn('text-xs uppercase tracking-wider', isActive(to) ? 'text-brand font-semibold' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}