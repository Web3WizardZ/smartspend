import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, Crown } from 'lucide-react';
import AppHeader from '../components/shared/AppHeader';
import Disclaimer from '../components/shared/Disclaimer';
import { getCurrencySymbol } from '@/lib/currency';
import { useCountry } from '@/context/CountryContext';

export default function CompareOptions() {
  const navigate = useNavigate();
  const { country: ctxCountry } = useCountry();
  const urlParams = new URLSearchParams(window.location.search);
  const retailerId = urlParams.get('retailer_id');
  const retailerName = urlParams.get('retailer_name');
  const category = urlParams.get('category');
  const amount = parseFloat(urlParams.get('amount'));
  // Prefer country from URL to avoid context hydration race
  const country = urlParams.get('country') || ctxCountry;
  const currencySymbol = getCurrencySymbol(country);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    const authed = await base44.auth.isAuthenticated();
    let profiles = [];
    let cards = [];
    if (authed) {
      const [p, c] = await Promise.all([
        base44.entities.PaymentProfile.list(),
        base44.entities.LoyaltyCard.list(),
      ]);
      profiles = p;
      cards = c;
    }

    const res = await base44.functions.invoke('spendiq', {
      retailer_id: retailerId,
      retailer_name: retailerName,
      category,
      amount,
      payment_profiles: profiles,
      loyalty_cards: cards,
      is_guest: !authed || profiles.length === 0,
      country,
    });
    setResult(res.data);
    setLoading(false);

    base44.analytics.track({ eventName: 'compare_options_viewed', properties: { retailer_name: retailerName, category, amount } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader showBack title="Other options" />
        <div className="max-w-lg mx-auto px-6 pt-16 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const options = result?.options || [];
  const confColor = {
    High: 'text-primary',
    Medium: 'text-amber-600',
    Low: 'text-orange-500',
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="Other options" />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        <p className="text-sm text-muted-foreground mb-6">
          Other combos we checked for <span className="font-semibold text-foreground">{retailerName}</span> at <span className="font-semibold text-foreground">{currencySymbol}{amount.toLocaleString()}</span>
        </p>

        <div className="space-y-3 mb-6">
          {options.map((opt, idx) => (
            <div key={idx} className={`bg-white rounded-2xl border p-4 transition-all ${idx === 0 ? 'border-primary shadow-sm' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {idx === 0 && <Crown className="w-4 h-4 text-primary" />}
                    <span className="text-xs font-semibold text-muted-foreground">
                      {idx === 0 ? 'Best estimated combo' : `Option ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                      {opt.payment_profile_name?.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{opt.payment_profile_name}</p>
                  </div>
                  {opt.loyalty_card_name && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center text-foreground text-[10px] font-bold">
                        {opt.loyalty_card_name?.charAt(0)}
                      </div>
                      <p className="text-sm text-muted-foreground">+ {opt.loyalty_card_name}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-foreground">{currencySymbol}{opt.estimated_value}</p>
                  <span className={`text-[10px] font-semibold ${confColor[opt.confidence] || confColor.Low}`}>
                    {opt.confidence}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Missing programmes */}
        {result?.missing_programmes?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-foreground mb-3">Programmes worth comparing</h4>
            <div className="space-y-2">
              {result.missing_programmes.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-2xl border border-border p-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p}</p>
                    <p className="text-xs text-muted-foreground">This programme may offer value for this type of spend.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs flex-shrink-0" onClick={() => navigate('/wallet?tab=loyalty')}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Disclaimer short />
      </div>
    </div>
  );
}