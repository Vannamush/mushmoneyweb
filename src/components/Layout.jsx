import React from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, History, CalendarDays, Tag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/history', label: 'History', icon: History },
  { to: '/months', label: 'Months', icon: CalendarDays },
  { to: '/categories', label: 'Tags', icon: Tag },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-background text-foreground max-w-md mx-auto">
      <main className="pb-28">
        <Outlet />
      </main>

      <button
        onClick={() => navigate('/add')}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center active:scale-95 transition"
        aria-label="Add expense"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>

      <nav className="fixed bottom-0 inset-x-0 max-w-md mx-auto bg-card border-t border-border z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 2).map((item) => (
            <NavBtn key={item.to} {...item} active={isActive(item.to)} />
          ))}
          <div className="w-16" />
          {navItems.slice(2).map((item) => (
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