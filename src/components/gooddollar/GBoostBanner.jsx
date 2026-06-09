import React from 'react';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoodDollar } from '@/context/GoodDollarContext';

/**
 * Small contextual banner shown on the Spend/Home screen.
 * Shows "Unlock G$ Boosts" if not activated, or a live boost hint if activated.
 */
export default function GBoostBanner() {
  const navigate = useNavigate();
  const { isActivated, profile } = useGoodDollar();

  if (isActivated) {
    return (
      <div
        className="flex items-center gap-3 bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 cursor-pointer hover:bg-primary/8 transition-colors"
        onClick={() => navigate('/wallet?tab=gooddollars')}
      >
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-primary">GoodDollar Rewards active</p>
          <p className="text-xs text-muted-foreground">
            G$ {profile?.g_balance?.toFixed(2) || '0.00'} · Compare a spend to unlock a boost
          </p>
        </div>
        <span className="text-xs text-primary font-semibold flex-shrink-0">View →</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 bg-gradient-to-r from-primary/8 to-primary/4 border border-primary/15 rounded-2xl px-4 py-3 cursor-pointer hover:from-primary/12 transition-all"
      onClick={() => navigate('/gooddollar-activation')}
    >
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Zap className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground">Unlock G$ Boosts</p>
        <p className="text-xs text-muted-foreground">Connect your GoodDollar account to earn daily rewards</p>
      </div>
      <span className="text-xs text-primary font-semibold flex-shrink-0">Connect →</span>
    </div>
  );
}
