import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, History, Tag, CreditCard, Receipt, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/lib/api';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/history', label: 'History', icon: History },
  { to: '/categories', label: 'Tags', icon: Tag },
  { to: '/pay', label: 'Pay', icon: CreditCard },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/bills', label: 'Bills', icon: Receipt },
];

export default function Layout() {
  const location = useLocation();
  const { data: categories = [] } = useCategories();

  const isActive = (path) => {
    const [p, q] = path.split('?');
    const baseMatch = p === '/' ? location.pathname === '/' : location.pathname.startsWith(p);
    if (!baseMatch) return false;
    if (q) {
      const linkParams = new URLSearchParams(q);
      const currentParams = new URLSearchParams(location.search);
      for (const [k, v] of linkParams) {
        if (currentParams.get(k) !== v) return false;
      }
      return true;
    }
    if (p === '/history') return !location.search.includes('category=');
    if (p === '/bills') return !location.search.includes('name=') && !location.search.includes('group=');
    return true;
  };

  const parents = categories
    .filter((c) => !c.parent_id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const childrenOf = (pid) => categories
    .filter((c) => c.parent_id === pid)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const sectionTarget = (parent, children) => {
    const cats = children.map((c) => c.name).join('|');
    return `/section?name=${encodeURIComponent(parent.name)}&category=${encodeURIComponent(cats)}`;
  };

  const catActive = (name) => {
    const currentParams = new URLSearchParams(location.search);
    return location.pathname === '/history' && currentParams.get('category') === name;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-border bg-card flex-col z-40">
        <div className="px-5 py-6 border-b border-border">
          <p className="text-sm text-muted-foreground">Mushmoney</p>
          <h1 className="text-lg font-semibold">Budget Tracker</h1>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                  active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}

          {parents.length > 0 && (
            <>
              <div className="pt-4">
                <div className="mx-3 border-t border-border" />
              </div>
              {parents.map((parent) => {
                const kids = childrenOf(parent.id);
                const parentTarget = sectionTarget(parent, kids);
                const parentActive = isActive(parentTarget);
                return (
                  <div key={parent.id} className="pt-2 space-y-0.5">
                    <Link
                      to={parentTarget}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                        parentActive ? 'bg-primary text-primary-foreground font-medium' : 'text-foreground font-medium hover:bg-muted'
                      )}
                    >
                      <span className="text-base leading-none">{parent.emoji}</span>
                      <span className="flex-1 truncate">{parent.name}</span>
                    </Link>
                    {kids.map((kid) => (
                      <Link
                        key={kid.id}
                        to={`/history?category=${encodeURIComponent(kid.name)}`}
                        className={cn(
                          'flex items-center gap-2 rounded-md py-1.5 pr-3 pl-9 text-sm transition',
                          catActive(kid.name) ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <span className="text-sm leading-none">{kid.emoji}</span>
                        <span className="flex-1 truncate">{kid.name}</span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-2xl pb-28 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 max-w-md mx-auto bg-card border-t border-border z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <NavBtn key={item.to} {...item} active={isActive(item.to)} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ to, label, icon: Icon, active }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-1 flex-1 h-full">
      <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-muted-foreground')} strokeWidth={active ? 2.5 : 2} />
      <span className={cn('text-[10px]', active ? 'text-primary font-medium' : 'text-muted-foreground')}>{label}</span>
    </Link>
  );
}