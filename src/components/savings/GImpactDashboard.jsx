import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, Globe, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function GImpactDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        setLoading(false);
        return;
      }

      const user = await base44.auth.me();
      
      // Get all user's G$ events
      const events = await base44.entities.EstimatedValueEvent.filter({ 
        user_confirmed_used: true,
        g_reward_amount: { $gt: 0 }
      }, '-created_date', 1000);

      const totalGEarned = events.reduce((sum, e) => sum + (e.g_reward_amount || 0), 0);
      const totalSpends = events.length;
      
      // Get GoodDollar profile
      const profiles = await base44.entities.GoodDollarProfile.filter({ user_id: user.id });
      const profile = profiles[0];
      
      // Calculate impact metrics (example conversions)
      const mealsEquivalent = Math.floor(totalGEarned * 0.5); //假设 1 G$ = 0.5 meals
      const localImpact = totalGEarned * 0.8; //假设 80% spent locally

      setStats({
        totalGEarned,
        totalSpends,
        currentBalance: profile?.g_balance || 0,
        identityStatus: profile?.identity_status,
        mealsEquivalent,
        localImpact,
        joinedDate: profile?.created_date,
      });
    } catch (e) {
      console.error('Failed to load impact stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-2">Connect GoodDollar to see your impact</p>
        <Button onClick={() => window.location.href = '/gooddollar-activation'}>
          Connect Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-primary mb-1">Your Total Impact</p>
            <p className="text-4xl font-extrabold text-foreground">G$ {stats.totalGEarned.toFixed(2)}</p>
          </div>
          <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Current Balance</p>
            <p className="text-lg font-bold text-foreground">G$ {stats.currentBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground mb-1">Spend Actions</p>
            <p className="text-lg font-bold text-foreground">{stats.totalSpends}</p>
          </div>
        </div>
      </div>

      {/* Real-World Impact */}
      <div>
        <h3 className="text-base font-bold text-foreground mb-3">Your Impact in Action</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-foreground">Meals Supported</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.mealsEquivalent}+</p>
            <p className="text-[10px] text-muted-foreground mt-1">Equivalent meals from G$ earnings</p>
          </div>
          
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-foreground">Local Impact</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">G$ {stats.localImpact.toFixed(0)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Spent in your community</p>
          </div>
        </div>
      </div>

      {/* Identity Status */}
      {stats.identityStatus && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">GoodDollar Identity</p>
              <p className="text-xs text-muted-foreground">
                {stats.identityStatus === 'verified' 
                  ? 'You\'re a verified human!' 
                  : stats.identityStatus === 'unverified'
                  ? 'Complete verification to unlock full benefits'
                  : 'Status unknown'}
              </p>
            </div>
            {stats.identityStatus === 'verified' ? (
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-lg">✓</span>
              </div>
            ) : (
              <Button size="sm" onClick={() => window.open('https://gooddapp.org', '_blank')}>
                Verify Now
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-12 rounded-2xl text-sm"
          onClick={() => window.open('https://gooddapp.org', '_blank')}
        >
          <Zap className="w-4 h-4 mr-2" />
          Claim UBI
        </Button>
        <Button 
          variant="outline" 
          className="h-12 rounded-2xl text-sm"
          onClick={() => window.location.href = '/campaigns'}
        >
          <Users className="w-4 h-4 mr-2" />
          Join Campaigns
        </Button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center">
        Impact calculations are estimates based on average G$ purchasing power. Actual impact may vary.
      </p>
    </div>
  );
}