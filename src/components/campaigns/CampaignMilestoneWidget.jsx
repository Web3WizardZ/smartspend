import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Trophy } from 'lucide-react';

// Milestone thresholds (actions completed)
const MILESTONES = [5, 10, 25, 50, 100];

function getNextMilestone(count) {
  return MILESTONES.find(m => m > count) || MILESTONES[MILESTONES.length - 1];
}

export default function CampaignMilestoneWidget({ userId }) {
  const { data: participations = [] } = useQuery({
    queryKey: ['milestone-participations', userId],
    queryFn: () => base44.entities.CampaignParticipation.filter({ user_id: userId }),
    enabled: !!userId,
  });

  const totalActions = participations.reduce((sum, p) => sum + (p.actions_completed || 0), 0);
  const totalG = participations.reduce((sum, p) => sum + (p.g_reward_amount || 0), 0);
  const nextMilestone = getNextMilestone(totalActions);
  const prevMilestone = MILESTONES[MILESTONES.indexOf(nextMilestone) - 1] || 0;
  const progress = nextMilestone === prevMilestone
    ? 100
    : Math.round(((totalActions - prevMilestone) / (nextMilestone - prevMilestone)) * 100);
  const actionsNeeded = nextMilestone - totalActions;
  const reachedMax = totalActions >= MILESTONES[MILESTONES.length - 1];

  if (participations.length === 0) return null;

  return (
    <div className="bg-white border border-border rounded-2xl p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Next reward milestone</p>
            <p className="text-xs text-muted-foreground">{totalActions} actions completed</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-primary">{reachedMax ? '🏆' : nextMilestone}</p>
          <p className="text-[10px] text-muted-foreground">{reachedMax ? 'Max reached!' : 'actions goal'}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative mb-2">
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
        <span>{prevMilestone} actions</span>
        <span>{nextMilestone} actions</span>
      </div>

      {/* Status */}
      {reachedMax ? (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Zap className="w-3.5 h-3.5" />
          All milestones completed! G$ {totalG.toFixed(0)} earned
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{actionsNeeded} more action{actionsNeeded !== 1 ? 's' : ''}</span> to next milestone
          </p>
          <div className="flex items-center gap-1 text-xs font-bold text-primary">
            <Zap className="w-3 h-3" />
            G$ {totalG.toFixed(0)} earned
          </div>
        </div>
      )}
    </div>
  );
}