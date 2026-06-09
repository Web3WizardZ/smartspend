import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Thabo M.',
    location: 'Johannesburg',
    quote: 'I had no idea my Standard Bank card earned eBucks at Checkers. SmartSpend showed me and now I earn R200 extra every month.',
    stars: 5,
    avatar: 'TM',
  },
  {
    name: 'Priya N.',
    location: 'Cape Town',
    quote: 'As someone with 5 loyalty cards, I could never remember which to use. SmartSpend does the thinking for me. Game changer!',
    stars: 5,
    avatar: 'PN',
  },
  {
    name: 'James K.',
    location: 'Nairobi',
    quote: 'The GoodDollar integration is brilliant. I earn my usual rewards PLUS G$ tokens. It\'s like double-dipping on savings.',
    stars: 5,
    avatar: 'JK',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">
            What Smart Spenders Say
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Join thousands who are already earning more on every purchase.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-muted/30 rounded-2xl p-6 border border-border flex flex-col">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-6 flex-1 italic">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}