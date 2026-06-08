import React from 'react';
import { Zap, TrendingUp, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoodDollar } from '@/context/GoodDollarContext';

export default function GDollarHomeWidget({ onClaimClick }) {
  const { profile, isActivated, shortAddress } = useGoodDollar();
  
  if (!isActivated || !profile) return null;

  const identityColor = {
    verified: 'text-primary',
    unverified: 'text-amber-600',
    failed: 'text-destructive',
    unknown: 'text-muted-foreground',
  }[profile.identity_status] || 'text-muted-foreground';

  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-5 border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary">GoodDollar Balance</p>
            <p className="text-lg font-bold text-foreground">G$ {profile.g_balance?.toFixed(2) || '0.00'}</p>
          </div>
        </div>
        {profile.wallet_address && (
          <a
            href={`https://celoscan.io/address/${profile.wallet_address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-primary" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Shield className={`w-3.5 h-3.5 ${identityColor}`} />
            <span className="text-[10px] text-muted-foreground">Identity</span>
          </div>
          <p className={`text-xs font-bold ${identityColor}`}>
            {profile.identity_status === 'verified' ? 'Verified ✓' : 
             profile.identity_status === 'unverified' ? 'Not verified' : 
             profile.identity_status || 'Unknown'}
          </p>
        </div>
        <div className="bg-white/60 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] text-muted-foreground">UBI Status</span>
          </div>
          <p className="text-xs font-bold text-foreground">
            {profile.ubi_claim_status === 'available' ? 'Ready to claim' :
             profile.ubi_claim_status === 'claimed' ? 'Claimed today' :
             profile.ubi_claim_status === 'not_eligible' ? 'Not eligible' : '—'}
          </p>
        </div>
      </div>

      {profile.ubi_claim_status === 'available' && (
        <Button 
          className="w-full h-10 rounded-xl text-sm font-semibold bg-primary hover:bg-primary/90"
          onClick={onClaimClick}
        >
          <Zap className="w-4 h-4 mr-2" />
          Claim Your Daily G$
        </Button>
      )}

      {profile.identity_status === 'unverified' && (
        <Button 
          variant="outline"
          className="w-full h-10 rounded-xl text-sm font-semibold border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={() => window.open('https://gooddapp.org', '_blank')}
        >
          <Shield className="w-4 h-4 mr-2" />
          Complete Verification
        </Button>
      )}
    </div>
  );
}