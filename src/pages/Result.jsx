import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp, Info, AlertCircle } from 'lucide-react';
import AppHeader from '../components/shared/AppHeader';
import Disclaimer from '../components/shared/Disclaimer';
import LogoAvatar from '../components/shared/LogoAvatar';
import GBoostResultCard from '../components/gooddollar/GBoostResultCard';
import { useGoodDollar } from '@/context/GoodDollarContext';

export default function Result() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const retailerId = urlParams.get('retailer_id');
  const retailerName = urlParams.get('retailer_name');
  const category = urlParams.get('category');
  const amount = parseFloat(urlParams.get('amount'));
  const amountBand = urlParams.get('amount_band');

  const { profile, isActivated } = useGoodDollar();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWhy, setShowWhy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [gRewardEarned, setGRewardEarned] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadResult();
  }, []);

  const loadResult = async () => {
    setLoading(true);
    const authed = await base44.auth.isAuthenticated();
    setIsAuthenticated(authed);

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
    });

    setResult(res.data);
    setLoading(false);

    base44.analytics.track({
      eventName: 'recommendation_result_viewed',
      properties: { retailer_name: retailerName, category, amount, amount_band: amountBand, estimated_value: res.data?.estimated_value }
    });
  };

  const handleConfirmUsed = async () => {
    setConfirmed(true);

    // Determine G$ reward for this spend action (campaign-based, 5 G$ per confirmed spend comparison)
    const isEligibleForGReward = isActivated && profile?.identity_status === 'verified';
    const gAmount = isEligibleForGReward ? 5 : 0;
    setGRewardEarned(gAmount);

    if (isAuthenticated && result?.best_combo) {
      await base44.entities.EstimatedValueEvent.create({
        retailer_name: retailerName,
        category,
        amount,
        estimated_value: result.best_combo.estimated_value,
        payment_profile_name: result.best_combo.payment_profile_name,
        loyalty_card_name: result.best_combo.loyalty_card_name,
        user_confirmed_used: true,
        g_reward_amount: gAmount,
        g_campaign_name: isEligibleForGReward ? 'Smart Grocery Challenge' : null,
        g_reward_source: isEligibleForGReward ? 'campaign' : 'none',
      });

      // Update G$ balance in profile if reward was earned
      if (gAmount > 0 && profile?.id) {
        await base44.entities.GoodDollarProfile.update(profile.id, {
          g_balance: (profile.g_balance || 0) + gAmount,
          last_synced_at: new Date().toISOString(),
        });
      }
    }
    base44.analytics.track({ eventName: 'used_combo_clicked', properties: { retailer_name: retailerName, amount, estimated_value: result?.estimated_value, g_reward_amount: gAmount } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader showBack title="" />
        <div className="max-w-lg mx-auto px-6 pt-16 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Calculating best estimated combo...</p>
        </div>
      </div>
    );
  }

  const best = result?.best_combo;
  const confColor = {
    High: 'text-primary bg-secondary',
    Medium: 'text-amber-600 bg-amber-50',
    Low: 'text-orange-600 bg-orange-50',
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="Best combo for you" onBack={() => navigate('/', { state: { fromResult: true } })} />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* Best combo badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-5">
          <Check className="w-3.5 h-3.5" /> Best estimated combo
        </div>

        {best ? (
          <>
            {/* Combo card */}
            <div className="bg-white rounded-3xl shadow-sm border border-border p-6 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Pay with */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Pay with</p>
                  <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl mx-auto mb-2 flex items-center justify-center text-primary font-bold text-sm">
                      {best.payment_profile_name?.charAt(0) || '?'}
                    </div>
                    <p className="text-sm font-bold text-foreground leading-tight">{best.payment_profile_name}</p>
                  </div>
                </div>
                {/* Scan */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Scan</p>
                  <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl mx-auto mb-2 flex items-center justify-center text-primary font-bold text-sm">
                      {best.loyalty_card_name?.charAt(0) || '—'}
                    </div>
                    <p className="text-sm font-bold text-foreground leading-tight">{best.loyalty_card_name || 'No loyalty card'}</p>
                  </div>
                </div>
              </div>

              {/* Estimated value */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Estimated total value</p>
                  <p className="text-4xl font-extrabold text-primary">R{best.estimated_value}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confColor[best.confidence] || confColor.Low}`}>
                  {best.confidence} confidence
                </span>
              </div>
            </div>

            {/* Why this combo */}
            <button
              onClick={() => setShowWhy(!showWhy)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-border mb-4 transition-colors hover:bg-muted/50"
            >
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Why this combo?
              </span>
              {showWhy ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showWhy && (
              <div className="bg-white rounded-2xl border border-border p-4 mb-4 space-y-3">
                {(best.reason_codes || []).map((code, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{formatReasonCode(code, retailerName, best)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* G$ Boost */}
            <GBoostResultCard retailerName={retailerName} category={category} />

            {/* Missing programmes */}
            {result.missing_programmes?.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-800">You may be missing loyalty value</p>
                </div>
                {result.missing_programmes.map((p, i) => (
                  <p key={i} className="text-sm text-amber-700 ml-6">{p} may be worth adding for this store.</p>
                ))}
                <Button variant="outline" size="sm" className="mt-3 ml-6 rounded-xl text-xs" onClick={() => navigate('/wallet?tab=loyalty')}>
                  Add to wallet
                </Button>
              </div>
            )}

            {/* Guest prompt */}
            {result.is_guest && (
              <div className="bg-primary/5 rounded-2xl p-5 mb-4 text-center">
                <p className="text-sm font-semibold text-foreground mb-1">Want a personalised result?</p>
                <p className="text-xs text-muted-foreground mb-3">Add your payment profiles and loyalty cards for accurate estimates.</p>
                <Button size="sm" className="rounded-xl" onClick={() => base44.auth.redirectToLogin()}>
                  Personalise my result
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                variant="outline"
                className="h-12 rounded-2xl text-sm font-semibold"
                onClick={() => navigate(`/compare-options?retailer_id=${retailerId}&retailer_name=${encodeURIComponent(retailerName)}&category=${encodeURIComponent(category)}&amount=${amount}`)}
              >
                Compare options
              </Button>
              <Button
                className={`h-12 rounded-2xl text-sm font-semibold ${confirmed ? 'bg-primary/80' : ''}`}
                onClick={handleConfirmUsed}
                disabled={confirmed}
              >
                {confirmed
                  ? gRewardEarned > 0 ? `+G$ ${gRewardEarned} Earned ✓` : 'Tracked ✓'
                  : 'I used this combo'}
              </Button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center">
            <p className="text-lg font-bold text-foreground mb-2">No estimates available</p>
            <p className="text-sm text-muted-foreground">We don't have enough data to estimate value for this combination yet.</p>
          </div>
        )}

        <Disclaimer short />
      </div>
    </div>
  );
}

function formatReasonCode(code, retailerName, best) {
  const messages = {
    LOYALTY_MATCH: `${best?.loyalty_card_name || 'Loyalty programme'} applies at ${retailerName}`,
    PAYMENT_PROFILE_MATCH: `${best?.payment_profile_name || 'Payment profile'} may earn rewards in this category`,
    CATEGORY_MATCH: 'Category match for reward estimation',
    HIGHER_ESTIMATED_VALUE: 'This combo appears to offer the highest estimated value',
    NO_PAYMENT_PROFILE: 'Add a payment profile for personalised estimates',
    NO_MATCHING_LOYALTY_CARD: 'No matching loyalty card saved',
    MISSING_PROGRAMME_OPPORTUNITY: 'There may be additional loyalty value available',
    TIER_UNKNOWN: 'Reward level unknown — confidence is reduced',
    CAP_MAY_APPLY: 'Actual reward may depend on caps or eligibility',
    LOW_CONFIDENCE_RULE: 'Estimate is based on limited data',
  };
  return messages[code] || code;
}