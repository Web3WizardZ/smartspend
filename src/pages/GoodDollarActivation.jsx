import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, TrendingUp, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/shared/AppHeader';
import { useGoodDollar } from '@/context/GoodDollarContext';

const STEPS = [
  { key: 'wallet', label: 'Preparing your rewards account' },
  { key: 'identity', label: 'Checking GoodDollar identity' },
  { key: 'balance', label: 'Fetching G$ balance' },
  { key: 'done', label: 'Rewards account ready' },
];

export default function GoodDollarActivation() {
  const navigate = useNavigate();
  const { isActivated, activating, activate, profile, shortAddress, connectExternalWallet } = useGoodDollar();
  const [step, setStep] = useState(null); // null | 'activating' | 'done' | 'error'
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [externalAddress, setExternalAddress] = useState('');
  const [linkingExternal, setLinkingExternal] = useState(false);
  const [externalError, setExternalError] = useState('');

  const handleActivate = async () => {
    setStep('activating');
    try {
      await activate();
      setStep('done');
    } catch (e) {
      setStep('error');
    }
  };

  const handleLinkExternal = async () => {
    setExternalError('');
    setLinkingExternal(true);
    try {
      await connectExternalWallet(externalAddress.trim());
      setStep('done');
    } catch (e) {
      setExternalError(e.message || 'Please check the address and try again.');
    }
    setLinkingExternal(false);
  };

  const IDENTITY_LABELS = {
    unknown: { label: 'Not checked', color: 'text-muted-foreground' },
    unverified: { label: 'Not yet verified', color: 'text-amber-600' },
    verified: { label: 'Verified human ✓', color: 'text-primary font-semibold' },
    failed: { label: 'Check failed', color: 'text-destructive' },
  };
  const UBI_MAP = { unknown: 'Not checked', available: 'Claimable', claimed: 'Claimed today', not_eligible: 'Not eligible' };

  if (step === 'activating') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader showBack title="Activating rewards" />
        <div className="flex-1 max-w-lg mx-auto px-6 pt-12 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2 text-center">Setting up your rewards account</h2>
          <p className="text-sm text-muted-foreground text-center mb-10">This only takes a moment.</p>
          <div className="w-full space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-3 bg-white rounded-2xl border border-border px-4 py-3">
                <div className="w-5 h-5 flex-shrink-0">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <span className="text-sm text-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'done' || isActivated) {
    const identity = IDENTITY_LABELS[profile?.identity_status] || IDENTITY_LABELS.unknown;
    return (
      <div className="min-h-screen bg-background">
        <AppHeader showBack title="GoodDollar Rewards" />
        <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
          {/* Success */}
          <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 mb-6 text-center">
            <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Your SmartSpend Rewards Account is ready</h2>
            <p className="text-sm text-muted-foreground">GoodDollar Rewards enabled on Celo Network</p>
          </div>

          {/* G$ Balance */}
          <div className="bg-white rounded-2xl border border-border p-5 mb-4">
            <p className="text-xs text-muted-foreground mb-1">G$ Balance</p>
            <p className="text-4xl font-extrabold text-foreground">G$ {profile?.g_balance?.toFixed(2) || '0.00'}</p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-border divide-y divide-border mb-4">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground"><Shield className="w-4 h-4" /><span className="text-sm">Identity status</span></div>
              <span className={`text-sm ${identity.color}`}>{identity.label}</span>
            </div>
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4" /><span className="text-sm">UBI claim</span></div>
              <span className="text-sm text-foreground">{UBI_MAP[profile?.ubi_claim_status] || '—'}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button className="h-12 rounded-2xl text-sm" onClick={() => navigate('/campaigns')}>
              Explore campaigns
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl text-sm" onClick={() => navigate('/wallet?tab=gooddollar')}>
              View rewards
            </Button>
          </div>

          {/* Advanced */}
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-xs text-muted-foreground">
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Advanced account details
          </button>
          {showAdvanced && (
            <div className="mt-3 bg-muted/40 rounded-xl p-4 space-y-2 text-xs text-muted-foreground">
              <p>Rewards account: <span className="font-mono text-foreground">{shortAddress || '—'}</span></p>
              <p>Wallet type: <span className="text-foreground capitalize">{profile?.wallet_type || 'embedded'}</span></p>
              <p>Network: <span className="text-foreground">Celo</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader showBack title="GoodDollar Rewards" />
        <div className="max-w-lg mx-auto px-6 pt-16 text-center">
          <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">Connection issue</h2>
          <p className="text-sm text-muted-foreground mb-6">Your account was created, but rewards setup needs another try.</p>
          <Button className="rounded-2xl h-12 mb-3" onClick={handleActivate}>Retry rewards setup</Button>
          <br />
          <button onClick={() => navigate(-1)} className="text-sm text-muted-foreground">Continue without rewards</button>
        </div>
      </div>
    );
  }

  // Default: not yet activated
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="GoodDollar Rewards" />
      <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Activate GoodDollar Rewards</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use your SmartSpend Rewards Account to view G$, unlock verified rewards, and join community campaigns.
          </p>
        </div>

        {/* Feature list */}
        <div className="bg-white rounded-2xl border border-border divide-y divide-border mb-6">
          {[
            { icon: <Zap className="w-4 h-4 text-primary" />, text: 'Earn G$ Boosts for verified spending actions' },
            { icon: <Shield className="w-4 h-4 text-primary" />, text: 'GoodDollar Identity protection' },
            { icon: <TrendingUp className="w-4 h-4 text-primary" />, text: 'Access UBI claim status and balance' },
            { icon: <CheckCircle2 className="w-4 h-4 text-primary" />, text: 'Join community campaigns and earn rewards' },
          ].map((f, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              {f.icon}
              <span className="text-sm text-foreground">{f.text}</span>
            </div>
          ))}
        </div>

        <Button className="w-full h-14 rounded-2xl text-base font-bold mb-3" onClick={handleActivate}>
          <Zap className="w-5 h-5 mr-2" /> Activate GoodDollar Rewards
        </Button>
        <p className="text-xs text-muted-foreground text-center mb-6">
          Your SmartSpend Rewards Account will be prepared automatically.
        </p>
        <button onClick={() => navigate(-1)} className="block w-full text-center text-sm text-muted-foreground mb-6">
          Not now
        </button>

        {/* Advanced: link existing wallet */}
        <div className="border-t border-border pt-4">
          <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-muted-foreground hover:text-foreground">
            Use an existing wallet instead ↓
          </button>
          {showAdvanced && (
            <div className="mt-3 space-y-2">
              <Input
                value={externalAddress}
                onChange={e => setExternalAddress(e.target.value)}
                placeholder="0x... Celo wallet address"
                className="rounded-xl h-11 text-sm font-mono"
              />
              {externalError && <p className="text-xs text-destructive">{externalError}</p>}
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl text-sm"
                onClick={handleLinkExternal}
                disabled={linkingExternal || !externalAddress.trim()}
              >
                {linkingExternal ? 'Linking…' : 'Link existing wallet'}
              </Button>
              <p className="text-xs text-muted-foreground">
                Already use GoodDollar? You can connect an existing Celo wallet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}