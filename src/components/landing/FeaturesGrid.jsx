import React from 'react';
import { Banknote, CreditCard, Barcode, Globe, Shield, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: 'Card Comparison',
    description: 'Compare all your bank cards and loyalty programmes in one place. See which earns most at every store.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Barcode className="w-5 h-5" />,
    title: 'Digital Loyalty Wallet',
    description: 'Store all your loyalty cards digitally. Never miss points because you forgot your card at home.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'Multi-Country Support',
    description: 'Works across South Africa, Kenya, Nigeria, Ghana, Brazil, Mexico, USA, and UK.',
    color: 'bg-green-50 text-primary',
  },
  {
    icon: <Banknote className="w-5 h-5" />,
    title: 'G$ Rewards',
    description: 'Earn GoodDollar tokens (G$) on top of your regular rewards. Real crypto, real value.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Privacy First',
    description: 'No bank login needed. Just tell us which cards you have — we never access your accounts.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: <Smartphone className="w-5 h-5" />,
    title: 'Mobile Ready',
    description: 'Works perfectly on your phone. Check rewards while you\'re in the checkout queue.',
    color: 'bg-teal-50 text-teal-600',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 bg-muted/40">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">
            Everything You Need to Spend Smarter
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            SmartSpend packs powerful features in a simple, beautiful app.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl p-6 border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
            >
              <div className={`w-10 h-10 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}