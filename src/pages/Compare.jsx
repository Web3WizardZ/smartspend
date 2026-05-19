import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import AppHeader from '../components/shared/AppHeader';
import LogoAvatar from '../components/shared/LogoAvatar';

const CATEGORIES = ['Groceries', 'Fuel', 'Pharmacy', 'Online Shopping', 'Restaurants', 'Clothing', 'General Retail'];
const AMOUNTS = [500, 1000, 2000, 4000];

export default function Compare() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Groceries');
  const [amount, setAmount] = useState(4000);

  const { data: rules = [] } = useQuery({
    queryKey: ['rules-for-compare', category],
    queryFn: async () => {
      const all = await base44.entities.RewardRule.filter({ active: true, category });
      return all;
    },
  });

  const { data: programmes = [] } = useQuery({
    queryKey: ['all-programmes'],
    queryFn: () => base44.entities.RewardProgramme.filter({ active: true }),
  });

  // Calculate estimates per programme for this category
  const estimates = rules
    .map(rule => {
      const prog = programmes.find(p => p.id === rule.programme_id);
      const monthlyMin = Math.round((rule.estimated_rate_percent / 100) * amount * 0.7);
      const monthlyMax = Math.round((rule.estimated_rate_percent / 100) * amount * 1.3);
      return {
        ...rule,
        programme: prog,
        monthlyMin,
        monthlyMax,
      };
    })
    .sort((a, b) => b.monthlyMax - a.monthlyMax);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Compare" rightAction={
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-8 text-xs rounded-xl border-0 bg-muted w-auto min-w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      } />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        <div className="bg-white rounded-2xl border border-border p-4 mb-6">
          <p className="text-xs text-muted-foreground mb-1">Based on your average spend of</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-extrabold text-foreground">R{amount.toLocaleString()}</p>
            <span className="text-sm text-muted-foreground">/ month</span>
          </div>
          <div className="flex gap-2 mt-3">
            {AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${amount === a ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                R{a.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <h3 className="text-sm font-bold text-foreground mb-3">Top loyalty programmes</h3>
        <p className="text-xs text-muted-foreground mb-4">Est. monthly value</p>

        <div className="space-y-3">
          {estimates.map((est, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
              <LogoAvatar
                initials={est.programme?.initials || est.programme_name?.charAt(0)}
                brandColour={est.programme?.brand_colour}
                name={est.programme_name}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{est.programme_name}</p>
                <p className="text-xs text-muted-foreground">{est.programme?.provider}</p>
              </div>
              <p className="text-sm font-bold text-primary whitespace-nowrap">
                R{est.monthlyMin} – R{est.monthlyMax}
              </p>
            </div>
          ))}
        </div>

        {estimates.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No reward data available for this category yet.</p>
        )}

        <p className="text-[11px] text-muted-foreground text-center mt-6">
          Estimates only. Actual rewards may vary. Not financial advice.
        </p>
      </div>
    </div>
  );
}