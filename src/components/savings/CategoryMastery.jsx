import React from 'react';
import { ShoppingCart, Zap, Pill, Globe, UtensilsCrossed, Shirt, Store, Plane } from 'lucide-react';

const ALL_CATEGORIES = [
  { name: 'Groceries', icon: ShoppingCart, color: 'text-emerald-600 bg-emerald-50' },
  { name: 'Fuel', icon: Zap, color: 'text-amber-600 bg-amber-50' },
  { name: 'Pharmacy', icon: Pill, color: 'text-blue-600 bg-blue-50' },
  { name: 'Online Shopping', icon: Globe, color: 'text-purple-600 bg-purple-50' },
  { name: 'Restaurants', icon: UtensilsCrossed, color: 'text-rose-600 bg-rose-50' },
  { name: 'Clothing', icon: Shirt, color: 'text-pink-600 bg-pink-50' },
  { name: 'General Retail', icon: Store, color: 'text-orange-600 bg-orange-50' },
  { name: 'Travel', icon: Plane, color: 'text-sky-600 bg-sky-50' },
];

function getMasteryLabel(count) {
  if (count === 0) return null;
  if (count >= 10) return '🏆 Master';
  if (count >= 5) return '⭐ Expert';
  if (count >= 1) return '✓ Explored';
  return null;
}

export default function CategoryMastery({ events = [] }) {
  // Count tracked purchases per category
  const categoryCounts = {};
  events.forEach(e => {
    if (e.category) categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  const unlockedCount = ALL_CATEGORIES.filter(c => (categoryCounts[c.name] || 0) > 0).length;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-foreground">Category Mastery</h3>
        <span className="text-xs text-muted-foreground font-medium">{unlockedCount}/{ALL_CATEGORIES.length} unlocked</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ALL_CATEGORIES.map(({ name, icon: Icon, color }) => {
          const count = categoryCounts[name] || 0;
          const unlocked = count > 0;
          const label = getMasteryLabel(count);
          return (
            <div
              key={name}
              className={`rounded-2xl p-3 text-center border transition-all ${unlocked ? 'bg-white border-border' : 'bg-muted/50 border-transparent opacity-50'}`}
            >
              <div className={`w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center ${unlocked ? color : 'bg-muted text-muted-foreground'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-[9px] font-semibold text-foreground leading-tight">{name}</p>
              {label && <p className="text-[8px] text-primary font-bold mt-0.5">{label}</p>}
              {!unlocked && <p className="text-[8px] text-muted-foreground mt-0.5">Locked</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}