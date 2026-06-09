import React from 'react';
import { ScanLine, Lightbulb, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: <ScanLine className="w-6 h-6" />,
    number: '1',
    title: 'Tell us where you\'re shopping',
    description: 'Search any retailer or browse by category. SmartSpend knows thousands of stores across South Africa and beyond.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    number: '2',
    title: 'See your best payment combo',
    description: 'Our engine matches your cards and loyalty programmes to the retailer — showing you exactly which combo earns the most.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    number: '3',
    title: 'Pay smarter, earn more',
    description: 'Use the recommended combo at checkout. Track your savings over time and watch your rewards stack up.',
    color: 'bg-green-50 text-primary',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-foreground mb-4">
            How SmartSpend Saves You Money
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three simple steps to start earning more from every purchase.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center group">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
              <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 shadow-sm`}>
                {step.icon}
              </div>
              <div className="bg-muted/60 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-foreground mx-auto -mt-9 mb-4 relative z-10">
                {step.number}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}