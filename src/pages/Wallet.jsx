import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, CreditCard, Barcode } from 'lucide-react';
import AppHeader from '../components/shared/AppHeader';
import LogoAvatar from '../components/shared/LogoAvatar';

export default function Wallet() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') === 'loyalty' ? 'loyalty' : 'payment';
  const [tab, setTab] = useState(initialTab);
  const [isAuth, setIsAuth] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    base44.auth.isAuthenticated().then(a => { setIsAuth(a); setChecking(false); });
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ['payment-profiles'],
    queryFn: () => base44.entities.PaymentProfile.list(),
    enabled: isAuth,
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['loyalty-cards'],
    queryFn: () => base44.entities.LoyaltyCard.list(),
    enabled: isAuth,
  });

  if (checking) return <div className="min-h-screen bg-background"><AppHeader title="Wallet" /></div>;

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader title="Wallet" />
        <div className="max-w-lg mx-auto px-6 pt-16 text-center">
          <CreditCard className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Your rewards wallet</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to save your payment profiles and loyalty cards for personalised estimates.</p>
          <Button className="rounded-2xl h-12 px-8" onClick={() => base44.auth.redirectToLogin()}>
            Sign in to get started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Wallet" rightAction={
        <Button variant="ghost" size="sm" className="text-primary text-xs font-semibold" onClick={() => navigate(tab === 'payment' ? '/add-payment-profile' : '/add-loyalty-card')}>
          <Plus className="w-4 h-4 mr-1" /> Add new
        </Button>
      } />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1 mb-6">
          <button
            onClick={() => setTab('payment')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'payment' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Payment profiles
          </button>
          <button
            onClick={() => setTab('loyalty')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === 'loyalty' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            Loyalty cards
          </button>
        </div>

        {tab === 'payment' && (
          <>
            {profiles.length === 0 ? (
              <EmptyState
                icon={<CreditCard className="w-10 h-10 text-primary" />}
                title="No payment profiles yet"
                desc="Payment profiles help SmartSpend estimate rewards. We do not store your bank card number or account details."
                cta="Add payment profile"
                onClick={() => navigate('/add-payment-profile')}
              />
            ) : (
              <div className="space-y-3">
                {profiles.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                    <LogoAvatar initials={p.initials || p.bank_name?.charAt(0)} brandColour={p.brand_colour} name={p.bank_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{p.nickname || `${p.bank_name} ${p.product_tier || ''}`.trim()}</p>
                      <p className="text-xs text-muted-foreground">{p.reward_programme} {p.reward_level ? `· ${p.reward_level}` : ''}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'loyalty' && (
          <>
            {cards.length === 0 ? (
              <EmptyState
                icon={<Barcode className="w-10 h-10 text-primary" />}
                title="No loyalty cards yet"
                desc="Add your loyalty cards to see which ones to scan at checkout."
                cta="Add loyalty card"
                onClick={() => navigate('/add-loyalty-card')}
              />
            ) : (
              <div className="space-y-3">
                {cards.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                    <LogoAvatar initials={c.initials || c.programme_name?.charAt(0)} brandColour={c.brand_colour} name={c.programme_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{c.programme_name}</p>
                      <p className="text-xs text-muted-foreground">{c.membership_number || c.retailer_name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, cta, onClick }) {
  return (
    <div className="text-center py-12">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">{desc}</p>
      <Button className="rounded-2xl" onClick={onClick}>{cta}</Button>
    </div>
  );
}