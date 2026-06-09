import React from 'react';
import { DollarSign, Users, Store, TrendingUp } from 'lucide-react';

export default function StatsBar() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-primary/90">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-3xl md:text-4xl font-extrabold mb-1">R1,250</p>
            <p className="text-xs md:text-sm text-white/80">Avg yearly savings</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-3xl md:text-4xl font-extrabold mb-1">50K+</p>
            <p className="text-xs md:text-sm text-white/80">Smart spenders</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Store className="w-6 h-6" />
            </div>
            <p className="text-3xl md:text-4xl font-extrabold mb-1">8,000+</p>
            <p className="text-xs md:text-sm text-white/80">Retailers covered</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl md:text-4xl font-extrabold mb-1">3.2%</p>
            <p className="text-xs md:text-sm text-white/80">Avg reward rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}