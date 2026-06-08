import React from 'react';
import { COUNTRIES, useCountry } from '@/context/CountryContext';
import { MapPin } from 'lucide-react';

const LOGO_URL = "https://media.base44.com/images/public/user_69ea57333f824d48a1afdd12/e7314e200_image.png";

export default function CountryPicker() {
  const { setCountry } = useCountry();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-white px-6 pt-10 pb-6 border-b border-border">
        <div className="max-w-lg mx-auto">
          <img src={LOGO_URL} alt="SmartSpend" className="w-12 h-12 rounded-2xl mb-3" />
          <h1 className="text-[15px] font-bold text-primary tracking-wide">SmartSpend</h1>
          <p className="text-[11px] text-primary/70 font-medium mb-6">Know what to pay with. Know what to scan.</p>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Where are you spending?</h2>
          </div>
          <p className="text-sm text-muted-foreground">Pick your country to see relevant stores and programmes.</p>
        </div>
      </div>

      <div className="flex-1 px-6 pt-6 pb-8">
        <div className="max-w-lg mx-auto grid grid-cols-2 gap-3">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              onClick={() => setCountry(c.code)}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border shadow-sm hover:border-primary hover:shadow-md transition-all active:scale-[0.98] text-left"
            >
              <span className="text-3xl">{c.flag}</span>
              <div>
                <p className="text-sm font-bold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.code}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}