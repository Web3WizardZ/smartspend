import React from 'react';
import { Zap, X } from 'lucide-react';

const MILESTONES = [5, 10, 25, 50, 100];

function getNextMilestone(count) {
  return MILESTONES.find(m => m > count) || null;
}

/**
 * Shows a motivational banner when the user is 1 or 2 actions away
 * from their next overall milestone across all participations.
 */
export default function MilestoneNudgeBanner({ participations, campaigns }) {
  const [dismissed, setDismissed] = React.useState(false);

  const totalActions = participations.reduce((sum, p) => sum + (p.actions_completed || 0), 0);
  const nextMilestone = getNextMilestone(totalActions);
  const actionsNeeded = nextMilestone ? nextMilestone - totalActions : null;

  // Find which active campaign the user is closest to completing
  const closestCampaign = participations
    .map(p => {
      const campaign = campaigns.find(c => c.id === p.campaign_id);
      const TARGET = 5;
      const needed = TARGET - (p.actions_completed || 0);
      return { campaign, needed, participation: p };
    })
    .filter(x => x.campaign && x.needed > 0 && x.needed <= 2)
    .sort((a, b) => a.needed - b.needed)[0];

  if (dismissed || actionsNeeded === null || actionsNeeded > 2) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
      <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
        <Zap className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-amber-900">
          {actionsNeeded === 1 ? "One action away from your next milestone! 🏆" : "Just 2 actions to go! Keep it up 🎯"}
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          {closestCampaign
            ? `Complete an action in "${closestCampaign.campaign.name}" to hit your ${nextMilestone}-action milestone.`
            : `Complete ${actionsNeeded} more action${actionsNeeded > 1 ? 's' : ''} across your campaigns to reach the ${nextMilestone}-action milestone.`
          }
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="p-1 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0">
        <X className="w-4 h-4 text-amber-500" />
      </button>
    </div>
  );
}