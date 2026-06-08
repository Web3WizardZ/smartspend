import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppHeader from '../components/shared/AppHeader';
import { CreditCard } from 'lucide-react';

const TIERS = ['Entry', 'Gold', 'Premier', 'Private / Platinum', 'Not sure'];
const LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Not sure'];

export default function AddPaymentProfile() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bank_name: '',
    product_tier: '',
    reward_programme: '',
    reward_level: '',
    reward_level_known: false,
  });

  const { data: bankProgrammes = [] } = useQuery({
    queryKey: ['bank-programmes'],
    queryFn: () => base44.entities.RewardProgramme.filter({ active: true, type: 'bank' }),
  });

  const selectedBank = bankProgrammes.find(b => b.provider === form.bank_name);

  const handleBankChange = (val) => {
    const bank = bankProgrammes.find(b => b.provider === val);
    setForm(prev => ({
      ...prev,
      bank_name: val,
      reward_programme: bank?.name || '',
    }));
  };

  const handleSave = async () => {
    if (!form.bank_name) return;
    setSaving(true);
    const levelKnown = form.reward_level && form.reward_level !== 'Not sure';
    await base44.entities.PaymentProfile.create({
      ...form,
      reward_level_known: levelKnown,
      initials: selectedBank?.initials || form.bank_name.charAt(0),
      brand_colour: selectedBank?.brand_colour || '#0B1F3F',
      confidence_level: levelKnown ? 'Medium' : 'Low',
      nickname: `${form.bank_name} ${form.product_tier || ''}`.trim(),
    });
    qc.invalidateQueries({ queryKey: ['payment-profiles'] });
    base44.analytics.track({ eventName: 'payment_profile_added', properties: { bank_name: form.bank_name } });
    navigate('/wallet');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="Add payment profile" />
      <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Tell us about your bank profile</h3>
            <p className="text-xs text-muted-foreground">This helps us estimate rewards. We do not store your card details.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Bank</Label>
            <Select value={form.bank_name} onValueChange={handleBankChange}>
              <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Select your bank" /></SelectTrigger>
              <SelectContent>
                {bankProgrammes.map(b => <SelectItem key={b.id} value={b.provider}>{b.provider}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Account / Card type</Label>
            <Select value={form.product_tier} onValueChange={val => setForm(p => ({ ...p, product_tier: val }))}>
              <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="e.g. Gold, Premier" /></SelectTrigger>
              <SelectContent>
                {TIERS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Reward programme</Label>
            <Input value={form.reward_programme} onChange={e => setForm(p => ({ ...p, reward_programme: e.target.value }))} className="h-12 rounded-2xl" placeholder="e.g. eBucks" />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Reward level (if you know)</Label>
            <Select value={form.reward_level} onValueChange={val => setForm(p => ({ ...p, reward_level: val }))}>
              <SelectTrigger className="h-12 rounded-2xl"><SelectValue placeholder="Select level or 'Not sure'" /></SelectTrigger>
              <SelectContent>
                {LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">Not sure about your level? Select "Not sure"</p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!form.bank_name || saving} className="w-full h-14 rounded-2xl text-base font-bold mt-8">
          {saving ? 'Saving...' : 'Save profile'}
        </Button>
      </div>
    </div>
  );
}