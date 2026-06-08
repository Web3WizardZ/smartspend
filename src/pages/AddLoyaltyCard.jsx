import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppHeader from '../components/shared/AppHeader';
import LogoAvatar from '../components/shared/LogoAvatar';
import { Search } from 'lucide-react';

export default function AddLoyaltyCard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [membershipNumber, setMembershipNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: programmes = [] } = useQuery({
    queryKey: ['loyalty-programmes'],
    queryFn: async () => {
      const all = await base44.entities.RewardProgramme.filter({ active: true });
      // Exclude bank-type programmes (those are payment profiles, not loyalty cards)
      return all.filter(p => p.type !== 'bank');
    },
  });

  const filtered = search
    ? programmes.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.provider.toLowerCase().includes(search.toLowerCase()))
    : programmes;

  const handleSelect = (programme) => {
    setSelectedProgramme(programme);
    setStep(2);
  };

  const handleSave = async () => {
    if (!selectedProgramme) return;
    setSaving(true);
    await base44.entities.LoyaltyCard.create({
      programme_name: selectedProgramme.name,
      programme_id: selectedProgramme.id,
      retailer_name: selectedProgramme.provider,
      membership_number: membershipNumber,
      barcode_value: membershipNumber,
      category: selectedProgramme.type === 'loyalty' ? 'Loyalty' : 'Other',
      initials: selectedProgramme.initials,
      brand_colour: selectedProgramme.brand_colour,
      logo_url: selectedProgramme.logo_url,
    });
    qc.invalidateQueries({ queryKey: ['loyalty-cards'] });
    base44.analytics.track({ eventName: 'loyalty_card_added', properties: { programme_name: selectedProgramme.name } });
    navigate('/wallet?tab=loyalty');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="Add loyalty card" />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s === 1 ? 'Choose' : s === 2 ? 'Details' : 'Done'}
              </span>
              {s < 3 && <div className="w-8 h-0.5 bg-muted" />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <h3 className="text-lg font-bold text-foreground mb-1">Choose loyalty programme</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search loyalty programme" className="pl-10 h-11 rounded-2xl" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border hover:border-primary hover:shadow-sm transition-all active:scale-95"
                >
                  <LogoAvatar logoUrl={p.logo_url} initials={p.initials} brandColour={p.brand_colour} name={p.name} size="md" />
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">{p.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-lg font-bold text-foreground mb-4">Card details</h3>
            <div className="bg-white rounded-2xl border border-border p-4 mb-6 flex items-center gap-3">
              <LogoAvatar initials={selectedProgramme?.initials} brandColour={selectedProgramme?.brand_colour} name={selectedProgramme?.name} size="md" />
              <div>
                <p className="text-sm font-bold text-foreground">{selectedProgramme?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedProgramme?.provider}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Membership / card number</Label>
                <Input value={membershipNumber} onChange={e => setMembershipNumber(e.target.value)} placeholder="Enter your membership number" className="h-12 rounded-2xl" />
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full h-14 rounded-2xl text-base font-bold mt-8">
              {saving ? 'Adding...' : 'Add loyalty card'}
            </Button>
            <button onClick={() => setStep(1)} className="w-full text-center mt-3 text-sm text-muted-foreground hover:text-foreground">
              Choose a different programme
            </button>
          </>
        )}
      </div>
    </div>
  );
}