import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const BADGES = [
  { id: 'first_combo', label: 'First Combo', emoji: '🎯', desc: 'Check your first spend combo', check: (events) => events.length >= 1 },
  { id: 'streak_3', label: '3-Day Streak', emoji: '🔥', desc: 'Use the app 3 days in a row', check: (events) => computeStreak(events) >= 3 },
  { id: 'streak_7', label: 'Week Warrior', emoji: '⚡', desc: '7-day streak', check: (events) => computeStreak(events) >= 7 },
  { id: 'g_earner', label: 'G$ Earner', emoji: '💚', desc: 'Earn your first G$ reward', check: (events) => events.some(e => (e.g_reward_amount || 0) > 0) },
  { id: 'categories_3', label: 'Explorer', emoji: '🧭', desc: 'Shop across 3 categories', check: (events) => new Set(events.map(e => e.category).filter(Boolean)).size >= 3 },
  { id: 'categories_5', label: 'Diversified', emoji: '🌟', desc: 'Shop across 5 categories', check: (events) => new Set(events.map(e => e.category).filter(Boolean)).size >= 5 },
  { id: 'spender_500', label: 'Big Spender', emoji: '💰', desc: 'Track R500+ in value', check: (events) => events.reduce((s, e) => s + (e.estimated_value || 0), 0) >= 500 },
  { id: 'spender_1000', label: 'Power Saver', emoji: '🏆', desc: 'Track R1000+ in value', check: (events) => events.reduce((s, e) => s + (e.estimated_value || 0), 0) >= 1000 },
];

function computeStreak(events) {
  const days = [...new Set(
    events.filter(e => e.user_confirmed_used).map(e => new Date(e.created_date).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b - a);
  if (!days.length) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if ((days[i - 1] - days[i]) / 86400000 <= 1) streak++;
    else break;
  }
  return streak;
}

export default function AchievementBadges() {
  const { data: events = [] } = useQuery({
    queryKey: ['value-events-badges'],
    queryFn: () => base44.entities.EstimatedValueEvent.list('-created_date', 100),
  });

  const earned = BADGES.filter(b => b.check(events));
  const locked = BADGES.filter(b => !b.check(events));

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">Achievements</p>
        <span className="text-xs text-muted-foreground">{earned.length}/{BADGES.length} earned</span>
      </div>
      <div className="p-4 grid grid-cols-4 gap-3">
        {BADGES.map(badge => {
          const unlocked = earned.includes(badge);
          return (
            <div key={badge.id} className="flex flex-col items-center gap-1 text-center">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl transition-all
                ${unlocked ? 'bg-primary/10' : 'bg-muted opacity-40 grayscale'}`}>
                {badge.emoji}
              </div>
              <p className={`text-[9px] font-semibold leading-tight ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {badge.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}