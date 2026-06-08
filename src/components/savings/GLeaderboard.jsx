import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy } from 'lucide-react';

export default function GLeaderboard({ currentUserId }) {
  // Fetch all G$-earning events (admin-level anonymized — just totals, no PII)
  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['g-leaderboard'],
    queryFn: () => base44.entities.EstimatedValueEvent.filter({ user_confirmed_used: true }),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || allEvents.length === 0) return null;

  // Aggregate G$ by user (anonymized)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEvents = allEvents.filter(e => new Date(e.created_date) >= monthStart && (e.g_reward_amount || 0) > 0);

  if (monthEvents.length === 0) return null;

  const totals = {};
  monthEvents.forEach(e => {
    const uid = e.created_by_id;
    totals[uid] = (totals[uid] || 0) + (e.g_reward_amount || 0);
  });

  const ranked = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([uid, g], i) => ({ rank: i + 1, isMe: uid === currentUserId, g }));

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="text-base font-bold text-foreground">G$ Leaderboard</h3>
        <span className="text-xs text-muted-foreground ml-auto">This month</span>
      </div>
      <div className="bg-white border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {ranked.map(({ rank, isMe, g }) => (
          <div key={rank} className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-primary/5' : ''}`}>
            <span className="text-base w-6 flex-shrink-0">{medals[rank - 1]}</span>
            <span className={`text-sm font-semibold flex-1 ${isMe ? 'text-primary' : 'text-foreground'}`}>
              {isMe ? 'You' : `Member #${rank}`}
            </span>
            <span className={`text-sm font-bold ${isMe ? 'text-primary' : 'text-muted-foreground'}`}>
              G$ {g.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}