import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '../components/shared/AppHeader';
import LogoAvatar from '../components/shared/LogoAvatar';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCountry } from '@/context/CountryContext';
import { getCurrencySymbol } from '@/lib/currency';

const QUICK_AMOUNTS = [10, 25, 50, 100, 250];

function getAmountBand(amount) {
  if (amount <= 10) return '0–10';
  if (amount <= 25) return '11–25';
  if (amount <= 50) return '26–50';
  if (amount <= 100) return '51–100';
  if (amount <= 250) return '101–250';
  return '250+';
}

export default function AmountInput() {
  const navigate = useNavigate();
  const { country } = useCountry();
  const currencySymbol = getCurrencySymbol(country);
  const urlParams = new URLSearchParams(window.location.search);
  const retailerId = urlParams.get('retailer_id');
  const retailerName = urlParams.get('retailer_name');
  const category = urlParams.get('category');

  const [amount, setAmount] = useState('');

  const { data: retailer } = useQuery({
    queryKey: ['retailer', retailerId],
    queryFn: async () => {
      const all = await base44.entities.Retailer.filter({ active: true });
      return all.find(r => r.id === retailerId);
    },
    enabled: !!retailerId,
  });

  const handleContinue = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    const band = getAmountBand(numAmount);
    navigate(`/result?retailer_id=${retailerId}&retailer_name=${encodeURIComponent(retailerName)}&category=${encodeURIComponent(category)}&amount=${numAmount}&amount_band=${encodeURIComponent(band)}`);
    
    base44.analytics.track({
      eventName: 'amount_entered',
      properties: { retailer_name: retailerName, category, amount: numAmount, amount_band: band }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="" />
      <div className="max-w-lg mx-auto px-6 pt-6">
        {/* Store info */}
        <div className="flex items-center gap-3 mb-8">
          <LogoAvatar
            logoUrl={retailer?.logo_url}
            initials={retailer?.initials || retailerName?.charAt(0)}
            brandColour={retailer?.brand_colour}
            name={retailerName}
            size="lg"
          />
          <div>
            <h2 className="text-xl font-bold text-foreground">{retailerName}</h2>
            <p className="text-sm text-muted-foreground">{category}</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-2">How much are you spending?</h3>
        <p className="text-sm text-muted-foreground mb-8">You can change this later</p>

        {/* Amount input */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">{currencySymbol}</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="h-20 pl-12 text-4xl font-bold text-primary bg-white rounded-2xl border-2 border-primary/20 focus:border-primary text-center"
            inputMode="decimal"
          />
        </div>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2 mb-8">
          {QUICK_AMOUNTS.map(qa => (
            <button
              key={qa}
              onClick={() => setAmount(String(qa))}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95
                ${amount === String(qa)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white border border-border text-foreground hover:border-primary'}`}
            >
              {currencySymbol}{qa.toLocaleString()}
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full h-14 rounded-2xl text-base font-bold"
        >
          Find best combo
        </Button>

        <button
          onClick={() => navigate(-1)}
          className="w-full text-center mt-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Choose a different store
        </button>
      </div>
    </div>
  );
}