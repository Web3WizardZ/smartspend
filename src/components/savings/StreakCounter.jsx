import React from 'react';
import { Flame } from 'lucide-react';

function computeStreak(events) {
  if (!events.length) return 0;
  // Get unique days with confirmed purchases, sorted descending
  const days = [...new Set(
    events
      .filter(e => e.user_confirmed_used)
      .map(e => new Date(e.created_date).toDateString())
  )].map(d => new Date(d)).sort((a, b) => b - a);

  if (!days.length) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (days[i - 1] - days[i]) / (1000 * 60 * 60 * 24);
    if (diff <= 1) streak++;
    else break;
  }
  return streak;
}

export default function StreakCounter({ events = [] }) {
  const streak = computeStreak(events);
  const milestones = [3, 7, 14, 30];
  const next = milestones.find(m => m > streak) || milestones[milestones.length - 1];

  if (streak === 0) return null;

  return (
    <div className="bg-white border border-border rounded-2xl p-4 mb-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${streak >= 7 ? 'bg-orange-100' : 'bg-amber-50'}`}>
        <Flame className={`w-6 h-6 ${streak >= 7 ? 'text-orange-500' : 'text-amber-500'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <p className="text-2xl font-extrabold text-foreground">{streak}</p>
          <p className="text-sm font-semibold text-muted-foreground">day streak 🔥</p>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
          <div
            className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((streak / next) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{next - streak} more day{next - streak !== 1 ? 's' : ''} to reach {next}-day milestone</p>
      </div>
    </div>
  );
}