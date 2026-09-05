import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, History, CalendarDays, Tag, Plus, CreditCard, Receipt, Car, GraduationCap, Building2, Building, ShoppingCart, HeartPulse, Landmark, Zap, Droplet, Trash2, Wifi, Wrench, KeyRound, Utensils, Coffee, ShoppingBasket, SprayCan, Banknote, FileText, Fuel, BatteryCharging, Bus, CarFront, ShieldCheck, PiggyBank, Hammer, CircleParking, Shirt } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/history', label: 'History', icon: History },
  { to: '/months', label: 'Months', icon: CalendarDays },
  { to: '/categories', label: 'Tags', icon: Tag },
  { to: '/pay', label: 'Pay', icon: CreditCard },
  { to: '/bills', label: 'Bills', icon: Receipt },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/history?category=Car', label: 'Car', icon: Car, desktopOnly: true },
  { to: '/history?category=Groceries', label: 'Groceries', icon: ShoppingCart, desktopOnly: true },
  { to: '/history?category=Medical', label: 'Medical', icon: HeartPulse, desktopOnly: true },
  { to: '/history?category=Dining Out', label: 'Dining Out', icon: Utensils, desktopOnly: true },
  { to: '/history?category=Coffee', label: 'Coffee', icon: Coffee, desktopOnly: true },
  { to: '/history?category=Household Supplies', label: 'Household Supplies', icon: ShoppingBasket, desktopOnly: true },
  { to: '/history?category=Toiletries', label: 'Toiletries', icon: SprayCan, desktopOnly: true },
  { to: '/history?category=Fuel', label: 'Fuel', icon: Fuel, desktopOnly: true },
  { to: '/history?category=EV Charging', label: 'EV Charging', icon: BatteryCharging, desktopOnly: true },
  { to: '/history?category=Public Transit', label: 'Public Transit', icon: Bus, desktopOnly: true },
  { to: '/history?category=Rideshare', label: 'Rideshare', icon: CarFront, desktopOnly: true },
  { to: '/history?category=Maintenance', label: 'Maintenance', icon: Hammer, desktopOnly: true },
  { to: '/history?category=Parking', label: 'Parking', icon: CircleParking, desktopOnly: true },
  { to: '/history?category=Clothing %26 Accessories', label: 'Clothing & Accessories', icon: Shirt, desktopOnly: true },
  { to: '/bills?name=Student Loans', label: 'Student Loans', icon: GraduationCap, desktopOnly: true },
  { to: '/bills?name=Mortgage', label: 'Mortgage', icon: Building2, desktopOnly: true },
  { to: '/bills?name=Property Taxes', label: 'Property Taxes', icon: Landmark, desktopOnly: true },
  { to: '/bills?name=HOA Fees', label: 'HOA Fees', icon: Building, desktopOnly: true },
  { to: '/bills?name=Electricity', label: 'Electricity', icon: Zap, desktopOnly: true },
  { to: '/bills?name=Water', label: 'Water', icon: Droplet, desktopOnly: true },
  { to: '/bills?name=Trash', label: 'Trash', icon: Trash2, desktopOnly: true },
  { to: '/bills?name=Internet', label: 'Internet', icon: Wifi, desktopOnly: true },
  { to: '/bills?name=Home Maintenance', label: 'Home Maintenance', icon: Wrench, desktopOnly: true },
  { to: '/bills?name=Rent', label: 'Rent', icon: KeyRound, desktopOnly: true },
  { to: '/bills?name=Auto Loan', label: 'Auto Loan', icon: Banknote, desktopOnly: true },
  { to: '/bills?name=Lease Payment', label: 'Lease Payment', icon: FileText, desktopOnly: true },
  { to: '/bills?name=Auto Insurance', label: 'Auto Insurance', icon: ShieldCheck, desktopOnly: true },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
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
    if (p === '/bills') return !location.search.includes('name=');
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
        <nav className="flex-1 px-3 py-4 space-y-1">
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
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={() => navigate('/add')}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground h-11 font-medium hover:bg-primary/90 transition"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} /> Add expense
          </button>
        </div>
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