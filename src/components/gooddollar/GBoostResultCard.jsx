import React from 'react';
import { Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGoodDollar } from '@/context/GoodDollarContext';

/**
 * Shown on the Result screen to highlight G$ boost opportunity.
 */
export default function GBoostResultCard({ retailerName, category }) {
  const navigate = useNavigate();
  const { isActivated, profile } = useGoodDollar();

  const isVerified = profile?.identity_status === 'verified';

  if (!isActivated) {
    return (
      <div className="bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/20 rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-sm font-bold text-foreground">G$ Boost available</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Activate GoodDollar Rewards to unlock a possible G$ reward for this verified comparison at {retailerName}.
        </p>
        <Button
          size="sm"
          className="rounded-xl h-9 text-xs"
          onClick={() => navigate('/gooddollar-activation')}
        >
          <Zap className="w-3.5 h-3.5 mr-1.5" /> Unlock G$ Boost
        </Button>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-amber-600" />
          <p className="text-sm font-bold text-amber-800">Verify to claim G$ rewards</p>
        </div>
        <p className="text-xs text-amber-700 mb-3">
          Verify your GoodDollar identity to claim rewards for this comparison.
        </p>
        <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs border-amber-300 text-amber-800"
          onClick={() => navigate('/gooddollar-activation')}>
          Verify identity
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-primary" />
        <p className="text-sm font-bold text-primary">G$ Boost eligible</p>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        You are eligible for a G$ Boost after completing this verified comparison.
      </p>
      <button
        onClick={() => navigate('/campaigns')}
        className="flex items-center gap-1 text-xs text-primary font-semibold"
      >
        Join a campaign to claim <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}