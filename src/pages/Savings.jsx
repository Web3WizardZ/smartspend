import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, CreditCard, Barcode, Zap } from 'lucide-react';
import AppHeader from '../components/shared/AppHeader';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGoodDollar } from '@/context/GoodDollarContext';

export default function Savings() {
  const navigate = useNavigate();
  const { isActivated, profile } = useGoodDollar();
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
  const totalGRewards = events.reduce((sum, e) => sum + (e.g_reward_amount || 0), 0);
  const gRewardEvents = events.filter(e => (e.g_reward_amount || 0) > 0);
  const topCategory = getMostCommon(events.map(e => e.category).filter(Boolean));
  const topLoyalty = getMostCommon(events.map(e => e.loyalty_card_name).filter(Boolean));
  const topPayment = getMostCommon(events.map(e => e.payment_profile_name).filter(Boolean));

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Savings" />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* Hero card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-6 text-primary-foreground mb-4">
          <p className="text-sm font-medium opacity-90 mb-1">Estimated value tracked</p>
          <p className="text-5xl font-extrabold mb-1">R{totalValue.toLocaleString()}</p>
          <p className="text-sm opacity-80">From {events.length} tracked purchases</p>
        </div>

        {/* G$ rewards summary */}
        {isActivated && (
          <div className="bg-white border border-primary/20 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">G$ rewards earned</p>
              <p className="text-2xl font-extrabold text-primary">G$ {(profile?.g_balance || totalGRewards).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">From {gRewardEvents.length} verified spend action{gRewardEvents.length !== 1 ? 's' : ''}</p>
            </div>
            <button
              className="text-xs text-primary font-semibold flex-shrink-0"
              onClick={() => navigate('/wallet?tab=gooddollar')}
            >
              View →
            </button>
          </div>
        )}

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
                <div key={e.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{e.retailer_name || 'Purchase'}</p>
                    <p className="text-xs text-muted-foreground">{e.category} · R{e.amount?.toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary">R{e.estimated_value}</p>
                    {(e.g_reward_amount || 0) > 0 && (
                      <p className="text-xs font-semibold text-primary flex items-center justify-end gap-0.5 mt-0.5">
                        <Zap className="w-3 h-3" />G$ {e.g_reward_amount}
                      </p>
                    )}
                  </div>
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