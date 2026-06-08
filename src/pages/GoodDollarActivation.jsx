import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Shield, TrendingUp, CheckCircle2, XCircle, ExternalLink, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppHeader from '@/components/shared/AppHeader';
import { useGoodDollar } from '@/context/GoodDollarContext';
import { base44 } from '@/api/base44Client';

const IDENTITY_LABELS = {
  unknown: { label: 'Not checked', color: 'text-muted-foreground' },
  unverified: { label: 'Not yet verified', color: 'text-amber-600' },
  verified: { label: 'Verified human ✓', color: 'text-primary font-semibold' },
  failed: { label: 'Check failed', color: 'text-destructive' },
};
const UBI_MAP = { unknown: 'Not checked', available: 'Claimable', claimed: 'Claimed today', not_eligible: 'Not eligible' };

// ── Connected dashboard ───────────────────────────────────────────────────────
function ConnectedDashboard({ profile, shortAddress, syncing, onSync, navigate }) {
  const identity = IDENTITY_LABELS[profile?.identity_status] || IDENTITY_LABELS.unknown;
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="GoodDollar Rewards" />
      <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
        {/* Success card */}
        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 mb-6 text-center">
          <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">GoodDollar Connected</h2>
          <p className="text-sm text-muted-foreground">Your verified G$ account is linked to SmartSpend</p>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-2xl border border-border p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">G$ Balance</p>
              <p className="text-4xl font-extrabold text-foreground">G$ {profile?.g_balance?.toFixed(2) || '0.00'}</p>
            </div>
            <button
              onClick={onSync}
              disabled={syncing}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${syncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status rows */}
        <div className="bg-white rounded-2xl border border-border divide-y divide-border mb-4">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground"><Shield className="w-4 h-4" /><span className="text-sm">Identity status</span></div>
            <span className={`text-sm ${identity.color}`}>{identity.label}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="w-4 h-4" /><span className="text-sm">UBI claim</span></div>
            <span className="text-sm text-foreground">{UBI_MAP[profile?.ubi_claim_status] || '—'}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground"><Zap className="w-4 h-4" /><span className="text-sm">Wallet</span></div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-mono text-foreground">{shortAddress || '—'}</span>
              {profile?.wallet_address && (
                <a href={`https://celoscan.io/address/${profile.wallet_address}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-12 rounded-2xl text-sm" onClick={() => navigate('/campaigns')}>
            Explore campaigns
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl text-sm" onClick={() => navigate('/wallet?tab=gooddollar')}>
            View rewards
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── "No G$ account yet" guide ─────────────────────────────────────────────────
function NoAccountGuide({ onBack }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="Get GoodDollar" />
      <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Create your GoodDollar account</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            GoodDollar is a free universal basic income (UBI) protocol. Sign up, complete face verification, and come back here to connect your rewards.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border divide-y divide-border mb-6">
          {[
            { step: '1', text: 'Go to GoodDapp and create a free account' },
            { step: '2', text: 'Complete face verification to become a verified human' },
            { step: '3', text: 'Copy your wallet address from your GoodDollar profile' },
            { step: '4', text: 'Come back here and paste it to connect your account' },
          ].map(item => (
            <div key={item.step} className="px-4 py-4 flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{item.step}</span>
              </div>
              <p className="text-sm text-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        <a
          href="https://gooddapp.org"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full"
        >
          <Button className="w-full h-14 rounded-2xl text-base font-bold mb-3">
            Open GoodDapp <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </a>
        <button
          onClick={onBack}
          className="block w-full text-center text-sm text-muted-foreground"
        >
          I already have an account — go back
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GoodDollarActivation() {
  const navigate = useNavigate();
  const { isActivated, linking, connectAddress, profile, shortAddress, sync, syncing } = useGoodDollar();
  const [view, setView] = useState('main'); // 'main' | 'connect' | 'no-account'
  const [address, setAddress] = useState('');
  const [verifyStatus, setVerifyStatus] = useState(null); // null | 'verified' | 'unverified'
  const [linkError, setLinkError] = useState('');
  const [isAuth, setIsAuth] = useState(null); // null = checking

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuth);
  }, []);

  // Already connected — show dashboard (handles both pre-existing and just-connected state)
  if (isActivated && profile) {
    return <ConnectedDashboard profile={profile} shortAddress={shortAddress} syncing={syncing} onSync={sync} navigate={navigate} />;
  }

  if (view === 'no-account') {
    return <NoAccountGuide onBack={() => setView('connect')} />;
  }

  const handleAddressChange = async (val) => {
    setAddress(val);
    setVerifyStatus(null);
    if (val.trim().length === 42 && val.trim().startsWith('0x')) {
      try {
        const { getIdentityStatus } = await import('@/services/goodDollarService');
        const status = await getIdentityStatus(val.trim());
        setVerifyStatus(status === 'verified' ? 'verified' : 'unverified');
      } catch {
        setVerifyStatus(null);
      }
    }
  };

  const handleConnect = async () => {
    setLinkError('');
    try {
      await connectAddress(address.trim());
      // Profile is now set in context — isActivated will become true and the
      // top-level guard above will render ConnectedDashboard with fresh data.
    } catch (e) {
      if (e.message?.includes('sign in')) {
        base44.auth.redirectToLogin(window.location.pathname);
      } else {
        setLinkError(e.message || 'Please check the address and try again.');
      }
    }
  };

  if (view === 'connect') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader showBack title="Connect GoodDollar Account" />
        <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Connect your verified account</h2>
            <p className="text-sm text-muted-foreground">Paste your GoodDollar wallet address below. We'll check your verification status instantly.</p>
          </div>

          <div className="space-y-3 mb-4">
            <Input
              value={address}
              onChange={e => handleAddressChange(e.target.value)}
              placeholder="0x... your GoodDollar wallet address"
              className="rounded-xl h-12 text-sm font-mono"
            />

            {/* Instant verification feedback */}
            {verifyStatus === 'verified' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-primary font-medium">Verified identity detected! Ready to connect.</p>
              </div>
            )}
            {verifyStatus === 'unverified' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">This address is not yet GoodDollar verified. You can still connect it and verify later.</p>
              </div>
            )}

            {linkError && <p className="text-xs text-destructive">{linkError}</p>}
          </div>

          <Button
            className="w-full h-14 rounded-2xl text-base font-bold mb-3"
            onClick={handleConnect}
            disabled={linking || !address.trim().startsWith('0x') || address.trim().length !== 42}
          >
            {linking ? 'Connecting…' : 'Connect Account'}
            {!linking && <ArrowRight className="w-5 h-5 ml-1" />}
          </Button>

          <button
            onClick={() => setView('no-account')}
            className="block w-full text-center text-sm text-muted-foreground"
          >
            I don't have a GoodDollar account yet →
          </button>
        </div>
      </div>
    );
  }

  // Default: main choice screen
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="GoodDollar Rewards" />
      <div className="max-w-lg mx-auto px-6 pt-6 pb-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Unlock Daily Rewards</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect your GoodDollar verified account to earn G$ rewards on every spend, access your UBI, and join community campaigns.
          </p>
        </div>

        {/* Feature list */}
        <div className="bg-white rounded-2xl border border-border divide-y divide-border mb-6">
          {[
            { icon: <Zap className="w-4 h-4 text-primary" />, text: 'Earn G$ Boosts for verified spending actions' },
            { icon: <Shield className="w-4 h-4 text-primary" />, text: 'GoodDollar Identity protection' },
            { icon: <TrendingUp className="w-4 h-4 text-primary" />, text: 'Access daily UBI claims and G$ balance' },
            { icon: <CheckCircle2 className="w-4 h-4 text-primary" />, text: 'Join community campaigns and earn rewards' },
          ].map((f, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              {f.icon}
              <span className="text-sm text-foreground">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA: connect existing — require sign-in first */}
        <Button
          className="w-full h-14 rounded-2xl text-base font-bold mb-3"
          onClick={() => isAuth ? setView('connect') : base44.auth.redirectToLogin(window.location.pathname)}
        >
          <Shield className="w-5 h-5 mr-2" />
          {isAuth === false ? 'Sign in to connect G$ account' : 'Connect my verified G$ account'}
        </Button>

        {/* Secondary CTA: no account */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-2xl text-sm mb-6"
          onClick={() => setView('no-account')}
        >
          I don't have a GoodDollar account yet
        </Button>

        <button
          onClick={() => navigate(-1)}
          className="block w-full text-center text-sm text-muted-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}