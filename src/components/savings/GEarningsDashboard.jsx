import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Trophy, CheckCircle2 } from 'lucide-react';

export default function GEarningsDashboard({ userId }) {
  const { data: participations = [] } = useQuery({
    queryKey: ['my-participations-dashboard', userId],
    queryFn: () => base44.entities.CampaignParticipation.filter({ user_id: userId }),
    enabled: !!userId,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns-dashboard'],
    queryFn: () => base44.entities.Campaign.list(),
  });

  // Only show participations that have earned some G$
  const rows = participations
    .filter(p => (p.g_reward_amount || 0) > 0 || (p.actions_completed || 0) > 0)
    .map(p => {
      const campaign = campaigns.find(c => c.id === p.campaign_id);
      return {
        id: p.id,
        campaign_name: campaign?.name || p.campaign_id || 'Unknown Campaign',
        actions_completed: p.actions_completed || 0,
        g_earned: p.g_reward_amount || 0,
        status: p.reward_eligibility,
      };
    });

  const totalG = rows.reduce((sum, r) => sum + r.g_earned, 0);
  const totalActions = rows.reduce((sum, r) => sum + r.actions_completed, 0);

  if (rows.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        G$ Campaign Earnings
      </h3>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total G$ Earned</p>
          <p className="text-2xl font-extrabold text-primary">G$ {totalG.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Actions Completed</p>
          <p className="text-2xl font-extrabold text-foreground">{totalActions}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
          <span className="col-span-5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Campaign</span>
          <span className="col-span-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Actions</span>
          <span className="col-span-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide text-right">G$ Earned</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {rows.map(row => (
            <div key={row.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
              <div className="col-span-5 flex items-center gap-2 min-w-0">
                {row.status === 'eligible' || row.status === 'claimed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                ) : (
                  <Trophy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                )}
                <span className="text-xs font-medium text-foreground truncate">{row.campaign_name}</span>
              </div>
              <div className="col-span-3 text-center">
                <span className="text-xs font-semibold text-foreground">{row.actions_completed}</span>
              </div>
              <div className="col-span-4 text-right">
                <span className={`text-xs font-bold ${row.g_earned > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                  G$ {row.g_earned.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer total */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/30 border-t border-border">
          <span className="col-span-5 text-xs font-bold text-foreground">Total</span>
          <span className="col-span-3 text-xs font-bold text-foreground text-center">{totalActions}</span>
          <span className="col-span-4 text-xs font-bold text-primary text-right">G$ {totalG.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}