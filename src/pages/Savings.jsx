import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, CreditCard, Barcode } from 'lucide-react';
import AppHeader from '../components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Savings() {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(a => { setIsAuth(a); setChecking(false); });
  }, []);

  const { data: events = [] } = useQuery({
    queryKey: ['value-events'],
    queryFn: () => base44.entities.EstimatedValueEvent.list('-created_date', 50),
    enabled: isAuth,
  });

  if (checking) return <div className="min-h-screen bg-background"><AppHeader title="Savings" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Savings" />
        <div className="max-w-lg mx-auto px-6 pt-16 text-center">
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Track estimated value</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to track estimated rewards value from your combos.</p>
          <Button className="rounded-2xl h-12 px-8" onClick={() => base44.auth.redirectToLogin()}>Sign in</Button>
        </div>
      </div>
    );
  }

  const totalValue = events.reduce((sum, e) => sum + (e.estimated_value || 0), 0);
  const topCategory = getMostCommon(events.map(e => e.category).filter(Boolean));
  const topLoyalty = getMostCommon(events.map(e => e.loyalty_card_name).filter(Boolean));
  const topPayment = getMostCommon(events.map(e => e.payment_profile_name).filter(Boolean));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Savings" />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* Hero card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground mb-6">
          <p className="text-sm font-medium opacity-90 mb-1">Estimated value tracked</p>
          <p className="text-5xl font-extrabold mb-1">R{totalValue.toLocaleString()}</p>
          <p className="text-sm opacity-80">From {events.length} tracked purchases</p>
        </div>

        {/* Highlights */}
        {events.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Your highlights</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <HighlightCard icon={<ShoppingBag className="w-4 h-4 text-primary" />} label="Top category" value={topCategory || '—'} />
              <HighlightCard icon={<Barcode className="w-4 h-4 text-primary" />} label="Top loyalty card" value={topLoyalty || '—'} />
              <HighlightCard icon={<CreditCard className="w-4 h-4 text-primary" />} label="Top payment profile" value={topPayment || '—'} />
              <HighlightCard icon={<TrendingUp className="w-4 h-4 text-primary" />} label="Best category" value={topCategory || '—'} />
            </div>

            {/* Recent activity */}
            <h3 className="text-base font-bold text-foreground mb-3">Recent activity</h3>
            <div className="space-y-2">
              {events.slice(0, 10).map(e => (
                <div key={e.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{e.retailer_name || 'Purchase'}</p>
                    <p className="text-xs text-muted-foreground">{e.category} · R{e.amount?.toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-bold text-primary">R{e.estimated_value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {events.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">Start checking combos and confirm usage to track value here.</p>
            <Button variant="outline" className="rounded-2xl" onClick={() => navigate('/')}>
              Check your first combo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-muted-foreground font-medium">{label}</span></div>
      <p className="text-sm font-bold text-foreground truncate">{value}</p>
    </div>
  );
}

function getMostCommon(arr) {
  if (!arr.length) return null;
  const counts = {};
  arr.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
}