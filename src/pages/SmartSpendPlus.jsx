import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Crown, TrendingUp, Bell, BarChart3, Heart, Zap, Trophy, Users, Shield } from 'lucide-react';
import AppHeader from '../components/shared/AppHeader';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://media.base44.com/images/public/user_69ea57333f824d48a1afdd12/e7314e200_image.png";

const FEATURES = [
  { icon: TrendingUp, label: 'Monthly value reports' },
  { icon: Bell, label: 'Smart reminders before you shop' },
  { icon: BarChart3, label: 'Advanced programme comparisons' },
  { icon: Heart, label: 'Favourite stores' },
  { icon: Zap, label: 'Deeper SpendIQ insights' },
  { icon: Crown, label: 'Cap and tier awareness notes' },
  { icon: Trophy, label: 'GoodDollar-powered community campaigns' },
  { icon: Shield, label: 'G$ Boost rewards for verified actions' },
  { icon: Users, label: 'Community rewards and local merchant support' },
];

export default function SmartSpendPlus() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="" />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="SmartSpend" className="w-16 h-16 rounded-2xl mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-foreground mb-1">SmartSpend+</h2>
          <p className="text-sm text-muted-foreground">Get more from every Rand you spend.</p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-3xl border border-border p-6 mb-6">
          <h3 className="text-sm font-bold text-foreground mb-4">What's included</h3>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, label }, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{label}</span>
                <Check className="w-4 h-4 text-primary ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl border-2 border-primary p-5 text-center relative">
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full">Popular</span>
            <p className="text-2xl font-extrabold text-foreground mt-1">R49</p>
            <p className="text-xs text-muted-foreground">/ month</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5 text-center">
            <p className="text-2xl font-extrabold text-foreground">R399</p>
            <p className="text-xs text-muted-foreground">/ year</p>
            <p className="text-[10px] text-primary font-semibold mt-1">Save R189</p>
          </div>
        </div>

        <Button className="w-full h-14 rounded-2xl text-base font-bold mb-3">
          Start SmartSpend+
        </Button>
        <p className="text-[11px] text-muted-foreground text-center mb-6">
          Cancel anytime. No commitments.
        </p>

        {/* GoodDollar campaigns shortcut */}
        <div
          onClick={() => navigate('/campaigns')}
          className="bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:from-primary/12 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">GoodDollar Campaigns</p>
            <p className="text-xs text-muted-foreground">Earn G$ rewards for smart spending actions</p>
          </div>
          <span className="text-xs text-primary font-semibold">View →</span>
        </div>
      </div>
    </div>
  );
}