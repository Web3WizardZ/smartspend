import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Start earning more today
            </h2>
            <p className="text-white/80 max-w-md mx-auto mb-8 text-sm md:text-base">
              Free forever. No bank login. Takes 2 minutes to set up and start seeing results.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="h-14 px-10 rounded-2xl text-base font-semibold bg-white text-primary hover:bg-white/90"
                onClick={() => navigate('/register')}
              >
                Create Free Account
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
            <p className="text-white/50 text-xs mt-4">
              Already have an account? <button onClick={() => navigate('/login')} className="underline hover:text-white/80">Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}