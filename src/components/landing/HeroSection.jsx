import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-primary/10 pt-16 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Earn rewards on every purchase</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
          Max Your Rewards.<br />
          <span className="text-primary">Every Time You Spend.</span>
        </h1>

        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          SmartSpend instantly tells you which payment card and loyalty programme to use 
          at any store — so you never leave money on the table again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button 
            size="lg" 
            className="h-14 px-10 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
            onClick={() => navigate('/register')}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-1" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14 px-10 rounded-2xl text-base"
            onClick={() => navigate('/')}
          >
            Try Guest Mode
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            No bank login required
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Results in seconds
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Free forever
          </div>
        </div>
      </div>
    </section>
  );
}