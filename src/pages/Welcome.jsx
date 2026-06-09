import React from 'react';
import HeroSection from '@/components/landing/HeroSection';
import StatsBar from '@/components/landing/StatsBar';
import HowItWorks from '@/components/landing/HowItWorks';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import Testimonials from '@/components/landing/Testimonials';
import CTASection from '@/components/landing/CTASection';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesGrid />
      <Testimonials />
      <CTASection />

      <footer className="py-8 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img 
              src="https://media.base44.com/images/public/user_69ea57333f824d48a1afdd12/e7314e200_image.png" 
              alt="SmartSpend" 
              className="w-6 h-6 rounded-lg"
            />
            <span className="text-sm font-bold text-foreground">SmartSpend</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SmartSpend. Earn smarter on every purchase.
          </p>
        </div>
      </footer>
    </div>
  );
}