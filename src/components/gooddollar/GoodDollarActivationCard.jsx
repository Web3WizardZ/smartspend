import React, { useState } from 'react';
import { Zap, CheckCircle2, AlertCircle, RefreshCw, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoodDollar } from '@/context/GoodDollarContext';

const IDENTITY_LABELS = {
  unknown: { label: 'Not checked', color: 'text-muted-foreground' },
  unverified: { label: 'Not verified', color: 'text-amber-600' },
  verified: { label: 'Verified human ✓', color: 'text-primary' },
  failed: { label: 'Check failed', color: 'text-destructive' },
};

const UBI_LABELS = {
  unknown: 'Not checked',
  available: 'Claimable',
  claimed: 'Claimed today',
  not_eligible: 'Not eligible',
};

export default function GoodDollarActivationCard({ onActivate, compact = false }) {
  const { profile, isActivated, linking, syncing, shortAddress, sync } = useGoodDollar();
  const [expanded, setExpanded] = useState(false);

  if (!isActivated) {
    return (
      <div className="bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Unlock G$ Boosts</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Activate GoodDollar Rewards to unlock verified rewards for smart spending actions.
            </p>
            <Button
              size="sm"
              className="mt-3 rounded-xl h-9 text-xs font-semibold"
              onClick={onActivate}
              disabled={linking}
            >
              {linking ? (
                <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Connecting…</>
              ) : (
                <><Zap className="w-3.5 h-3.5 mr-1.5" /> Connect G$ account</>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary">GoodDollar Rewards active</p>
          <p className="text-xs text-muted-foreground">G$ {profile?.g_balance?.toFixed(2) || '0.00'} balance</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary font-semibold">
          {expanded ? 'Less' : 'Details'}
        </button>
      </div>
    );
  }

  const identityInfo = IDENTITY_LABELS[profile?.identity_status] || IDENTITY_LABELS.unknown;

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-primary-foreground" />
          <div>
            <p className="text-sm font-bold text-primary-foreground">GoodDollar Rewards</p>
            <p className="text-xs text-primary-foreground/80">Active · Celo Network</p>
          </div>
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Balance */}
      <div className="px-5 py-4 border-b border-border">
        <p className="text-xs text-muted-foreground mb-1">G$ Balance</p>
        <p className="text-3xl font-extrabold text-foreground">
          G$ {syncing ? '…' : (profile?.g_balance?.toFixed(2) || '0.00')}
        </p>
      </div>

      {/* Status rows */}
      <div className="px-5 py-4 space-y-3">
        <StatusRow
          icon={<Shield className="w-4 h-4" />}
          label="Identity status"
          value={identityInfo.label}
          valueColor={identityInfo.color}
        />
        <StatusRow
          icon={<TrendingUp className="w-4 h-4" />}
          label="UBI claim status"
          value={UBI_LABELS[profile?.ubi_claim_status] || 'Unknown'}
          valueColor={profile?.ubi_claim_status === 'available' ? 'text-primary' : 'text-muted-foreground'}
        />
      </div>

      {/* Advanced details */}
      <div className="px-5 pb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? 'Hide details ↑' : 'Advanced details ↓'}
        </button>
        {expanded && (
          <div className="mt-3 bg-muted/40 rounded-xl p-3 space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Rewards account: <span className="font-mono text-foreground">{shortAddress || '—'}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Wallet type: <span className="text-foreground capitalize">{profile?.wallet_type || 'embedded'}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Network: <span className="text-foreground">Celo</span>
            </p>
            {profile?.last_synced_at && (
              <p className="text-xs text-muted-foreground">
                Last synced: {new Date(profile.last_synced_at).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRow({ icon, label, value, valueColor }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className={`text-xs font-semibold ${valueColor}`}>{value}</span>
    </div>
  );
}