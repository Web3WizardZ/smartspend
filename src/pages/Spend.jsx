import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import StoreChip from '../components/spend/StoreChip';
import GBoostBanner from '../components/gooddollar/GBoostBanner';

const LOGO_URL = "https://media.base44.com/images/public/user_69ea57333f824d48a1afdd12/e7314e200_image.png";

export default function Spend() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: retailers = [], isLoading } = useQuery({
    queryKey: ['retailers'],
    queryFn: () => base44.entities.Retailer.filter({ active: true }, 'sort_order', 50),
  });

  const popularStores = retailers.filter(r => r.popular);
  const filteredStores = search
    ? retailers.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleStoreSelect = (retailer) => {
    navigate(`/amount?retailer_id=${retailer.id}&retailer_name=${encodeURIComponent(retailer.name)}&category=${encodeURIComponent(retailer.category)}`);
  };

  const categories = [...new Set(retailers.map(r => r.category))];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-white px-6 pt-10 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <img src={LOGO_URL} alt="SmartSpend" className="w-12 h-12 rounded-2xl" />
          </div>
          <h1 className="text-[15px] font-bold text-primary mt-3 tracking-wide">SmartSpend</h1>
          <p className="text-[11px] text-primary/70 font-medium mb-6">Know what to pay with. Know what to scan.</p>

          <h2 className="text-2xl font-bold text-foreground mb-1">Where are you spending?</h2>
          <p className="text-sm text-muted-foreground mb-4">Check your best estimated rewards combo before you pay.</p>

          {/* G$ Boost banner */}
          <div className="mb-5">
            <GBoostBanner />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search store or category"
              className="pl-11 h-12 rounded-2xl bg-muted/50 border-0 text-sm"
            />
          </div>

          {/* Search results */}
          {search && (
            <div className="mt-4 space-y-1">
              {filteredStores.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">No stores found</p>
              )}
              {filteredStores.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleStoreSelect(r)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: r.brand_colour || 'hsl(var(--primary))' }}>
                    {r.initials || r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular stores */}
      {!search && (
        <div className="px-6 pt-6 pb-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground">Popular stores</h3>
              <button onClick={() => setSearch(' ')} className="text-xs font-semibold text-primary">See all</button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-4 gap-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted animate-pulse" />
                    <div className="w-10 h-3 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {popularStores.slice(0, 8).map(r => (
                  <StoreChip key={r.id} retailer={r} onClick={handleStoreSelect} />
                ))}
              </div>
            )}

            {/* Categories */}
            <h3 className="text-base font-bold text-foreground mt-8 mb-4">Browse by category</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => {
                const catStores = retailers.filter(r => r.category === cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSearch(cat)}
                    className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold text-sm">
                      {cat.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-foreground">{cat}</p>
                      <p className="text-xs text-muted-foreground">{catStores.length} stores</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}