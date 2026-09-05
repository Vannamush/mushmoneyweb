import React, { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, History, Tag, Plus, CreditCard, Receipt, Car, HeartPulse, ShoppingBasket, PiggyBank, MonitorPlay, Activity, ShoppingBag, Gift, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/history', label: 'History', icon: History },
  {
    to: '/categories', label: 'Tags', icon: Tag,
    children: [
      { to: '/add', label: 'Add expense', icon: Plus, primary: true },
      { to: '/categories', label: 'Manage tags' },
    ],
  },
  { to: '/pay', label: 'Pay', icon: CreditCard },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  {
    to: '/bills', label: 'Bills', icon: Receipt,
    children: [
      { to: '/bills?group=housing', label: 'Housing & Essentials' },
      { to: '/bills?group=transportation', label: 'Transportation' },
    ],
  },
  {
    label: 'Daily Living & Food', icon: ShoppingBasket, desktopOnly: true,
    children: [
      {
        label: 'Food & Drink',
        children: [
          { to: '/history?category=Groceries', label: 'Groceries' },
          { to: '/history?category=Dining Out', label: 'Dining Out' },
          { to: '/history?category=Coffee', label: 'Coffee' },
        ],
      },
      {
        label: 'Household & Care',
        children: [
          { to: '/history?category=Household Supplies', label: 'Household Supplies' },
          { to: '/history?category=Toiletries', label: 'Toiletries' },
          { to: '/history?category=Personal Care (Haircuts%2C Grooming)', label: 'Personal Care' },
        ],
      },
    ],
  },
  {
    label: 'Transportation', icon: Car, desktopOnly: true,
    children: [
      {
        label: 'Vehicle',
        children: [
          { to: '/history?category=Car', label: 'Car' },
          { to: '/history?category=Fuel', label: 'Fuel' },
          { to: '/history?category=EV Charging', label: 'EV Charging' },
          { to: '/history?category=Maintenance', label: 'Maintenance' },
        ],
      },
      {
        label: 'Transit & Rides',
        children: [
          { to: '/history?category=Public Transit', label: 'Public Transit' },
          { to: '/history?category=Rideshare', label: 'Rideshare' },
          { to: '/history?category=Parking', label: 'Parking' },
        ],
      },
    ],
  },
  {
    label: 'Lifestyle & Personal', icon: ShoppingBag, desktopOnly: true,
    children: [
      {
        label: 'Shopping',
        children: [
          { to: '/history?category=Clothing %26 Accessories', label: 'Clothing & Accessories' },
          { to: '/history?category=Shopping', label: 'Shopping' },
          { to: '/history?category=Electronics', label: 'Electronics' },
        ],
      },
      {
        label: 'Leisure',
        children: [
          { to: '/history?category=Entertainment', label: 'Entertainment' },
          { to: '/history?category=Hobbies', label: 'Hobbies' },
          { to: '/history?category=Recreation', label: 'Recreation' },
        ],
      },
    ],
  },
  {
    label: 'Subscriptions & Digital', icon: MonitorPlay, desktopOnly: true,
    children: [
      {
        label: 'Media & News',
        children: [
          { to: '/history?category=Streaming', label: 'Streaming' },
          { to: '/history?category=News', label: 'News' },
          { to: '/history?category=Magazines', label: 'Magazines' },
          { to: '/history?category=Magazine Subscriptions', label: 'Magazine Subscriptions' },
        ],
      },
      {
        label: 'Software & Fitness',
        children: [
          { to: '/history?category=Software %26 Cloud Storage', label: 'Software & Cloud Storage' },
          { to: '/history?category=Gym', label: 'Gym' },
          { to: '/history?category=Fitness Memberships', label: 'Fitness Memberships' },
        ],
      },
    ],
  },
  {
    label: 'Health & Wellness', icon: Activity, desktopOnly: true,
    children: [
      {
        label: 'Medical & Dental',
        children: [
          { to: '/history?category=Health', label: 'Health' },
          { to: '/history?category=Dental', label: 'Dental' },
          { to: '/history?category=Doctor %26 Specialist Visits', label: 'Doctor & Specialist Visits' },
        ],
      },
      {
        label: 'Pharmacy & Fitness',
        children: [
          { to: '/history?category=Medical|Pharmacy %26 Medications', label: 'Pharmacy & Medications' },
          { to: '/history?category=Fitness Equipment %26 Supplements', label: 'Fitness Equipment & Supplements' },
        ],
      },
    ],
  },
  {
    label: 'Life Events, Giving & Misc', icon: Gift, desktopOnly: true,
    children: [
      {
        label: 'Travel & Celebrations',
        children: [
          { to: '/history?category=Travel%2C Flights%2C %26 Hotels', label: 'Travel, Flights & Hotels' },
          { to: '/history?category=Gifts %26 Celebrations', label: 'Gifts & Celebrations' },
        ],
      },
      {
        label: 'Giving & Obligations',
        children: [
          { to: '/history?category=Charitable Donations', label: 'Charitable Donations' },
          { to: '/history?category=Taxes %26 Legal Fees', label: 'Taxes & Legal Fees' },
        ],
      },
    ],
  },
];

const leafPaths = (item) => {
  const out = [];
  const walk = (nodes) => nodes.forEach((n) => {
    if (n.to) out.push(n.to);
    else if (n.children) walk(n.children);
  });
  if (item.children) walk(item.children);
  return out;
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState({});
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
  const mobileItems = navItems.filter((i) => !i.desktopOnly);

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
            if (item.children) {
              const parentActive = leafPaths(item).some(isActive);
              const open = openGroups[item.label] ?? parentActive;
              return (
                <div key={item.label}>
                  <button
                    onClick={() => setOpenGroups((s) => ({ ...s, [item.label]: !s[item.label] }))}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                      parentActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                  </button>
                  {open && (
                    <div className="mt-1 ml-5 space-y-1 border-l border-border pl-3">
                      {item.children.map((child) => {
                        if (child.children) {
                          const subActive = child.children.some((c) => isActive(c.to));
                          const subKey = `${item.label}/${child.label}`;
                          const subOpen = openGroups[subKey] ?? subActive;
                          return (
                            <div key={child.label}>
                              <button
                                onClick={() => setOpenGroups((s) => ({ ...s, [subKey]: !s[subKey] }))}
                                className={cn(
                                  'w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
                                  subActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                              >
                                <span className="flex-1 text-left">{child.label}</span>
                                <ChevronDown className={cn('h-4 w-4 transition-transform', subOpen && 'rotate-180')} />
                              </button>
                              {subOpen && (
                                <div className="mt-0.5 ml-3 space-y-0.5 border-l border-border pl-2">
                                  {child.children.map((leaf) => {
                                    const active = isActive(leaf.to);
                                    return (
                                      <Link
                                        key={leaf.to}
                                        to={leaf.to}
                                        className={cn(
                                          'flex items-center rounded-md px-3 py-2 text-sm transition',
                                          active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        )}
                                      >
                                        {leaf.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }
                        const active = isActive(child.to);
                        return (
                          <Link
                            key={child.to}
                            to={child.to}
                            className={cn(
                              'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
                              child.primary
                                ? 'bg-primary text-primary-foreground font-medium hover:bg-primary/90'
                                : active
                                  ? 'bg-primary text-primary-foreground font-medium'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {child.icon && <child.icon className="h-4 w-4" />}
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
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
        </nav>
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-2xl pb-28 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Mobile floating add button */}
      <button
        onClick={() => navigate('/add')}
        className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center active:scale-95 transition"
        aria-label="Add expense"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 max-w-md mx-auto bg-card border-t border-border z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileItems.slice(0, 2).map((item) => (
            <NavBtn key={item.to} {...item} active={isActive(item.to)} />
          ))}
          <div className="w-16" />
          {mobileItems.slice(2).map((item) => (
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