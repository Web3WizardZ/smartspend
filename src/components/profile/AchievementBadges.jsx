import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Star, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AchievementBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        setLoading(false);
        return;
      }

      const events = await base44.entities.EstimatedValueEvent.filter({ user_confirmed_used: true }, '-created_date', 100);
      const totalG = events.reduce((sum, e) => sum + (e.g_reward_amount || 0), 0);
      const totalSpends = events.length;
      
      const earned = [];
      
      // First spend
      if (totalSpends >= 1) {
        earned.push({
          id: 'first_spend',
          name: 'First Steps',
          description: 'Tracked your first spend',
          icon: '🎯',
          color: 'bg-blue-100 text-blue-700',
        });
      }

      // 10 spends
      if (totalSpends >= 10) {
        earned.push({
          id: 'dedicated_user',
          name: 'Dedicated Saver',
          description: 'Tracked 10 spends',
          icon: '💪',
          color: 'bg-purple-100 text-purple-700',
        });
      }

      // G$ earner
      if (totalG > 0) {
        earned.push({
          id: 'g_earner',
          name: 'G$ Earner',
          description: `Earned G$ ${totalG}`,
          icon: '💰',
          color: 'bg-green-100 text-green-700',
        });
      }

      // G$ 50+ earner
      if (totalG >= 50) {
        earned.push({
          id: 'g_champion',
          name: 'G$ Champion',
          description: 'Earned G$ 50+',
          icon: '🏆',
          color: 'bg-yellow-100 text-yellow-700',
        });
      }

      // Verified identity
      const profiles = await base44.entities.GoodDollarProfile.filter({});
      const profile = profiles[0];
      if (profile?.identity_status === 'verified') {
        earned.push({
          id: 'verified_human',
          name: 'Verified Human',
          description: 'Completed GoodDollar verification',
          icon: '✓',
          color: 'bg-primary/20 text-primary',
        });
      }

      setBadges(earned);
    } catch (e) {
      console.error('Failed to load badges:', e);
    } finally {
      setLoading(false);
    }
  };

  const lockedBadges = [
    { id: 'streak_7', name: '7-Day Streak', description: 'Claim UBI 7 days in a row', icon: '🔥', locked: true },
    { id: 'referral', name: 'Ambassador', description: 'Invite 3 friends', icon: '👥', locked: true },
    { id: 'g_100', name: 'G$ Master', description: 'Earn G$ 100+', icon: '👑', locked: true },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-bold text-foreground mb-4">Your Achievements</h3>
      
      {badges.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No badges yet</p>
          <p className="text-xs text-muted-foreground">Start tracking spends to earn achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {badges.map(badge => (
            <div key={badge.id} className={`${badge.color} rounded-2xl p-3 text-center`}>
              <div className="text-2xl mb-1">{badge.icon}</div>
              <p className="text-[10px] font-bold leading-tight">{badge.name}</p>
            </div>
          ))}
        </div>
      )}

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Locked Badges</h4>
      <div className="grid grid-cols-3 gap-3">
        {lockedBadges.map(badge => (
          <div key={badge.id} className="bg-muted/50 rounded-2xl p-3 text-center opacity-60">
            <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
            <p className="text-[10px] font-bold leading-tight text-muted-foreground">{badge.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}