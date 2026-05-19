import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Wallet, TrendingUp, BarChart3, UserCircle } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Spend', icon: Zap },
  { path: '/wallet', label: 'Wallet', icon: Wallet },
  { path: '/savings', label: 'Savings', icon: TrendingUp },
  { path: '/compare', label: 'Compare', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}