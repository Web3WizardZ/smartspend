import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, Zap, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import CampaignProgressCircle from '@/components/campaigns/CampaignProgressCircle';
import CampaignGuideChat from '@/components/campaigns/CampaignGuideChat';
import CampaignMilestoneWidget from '@/components/campaigns/CampaignMilestoneWidget';
import MilestoneNudgeBanner from '@/components/campaigns/MilestoneNudgeBanner';
import { Button } from '@/components/ui/button';
import AppHeader from '@/components/shared/AppHeader';
import { useGoodDollar } from '@/context/GoodDollarContext';

export default function Campaigns() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { isActivated, profile } = useGoodDollar();
  const [isAuth, setIsAuth] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (a) => {
      setIsAuth(a);
      if (a) { const me = await base44.auth.me(); setUserId(me.id); }
    });
  }, []);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.filter({ active: true }),
  });

  const { data: participations = [] } = useQuery({
    queryKey: ['my-participations', userId],
    queryFn: () => base44.entities.CampaignParticipation.filter({ user_id: userId }),
    enabled: !!userId,
  });

  const joinMutation = useMutation({
    mutationFn: async (campaignId) => {
      const campaign = campaigns.find(c => c.id === campaignId);
      await base44.entities.CampaignParticipation.create({
        campaign_id: campaignId,
        user_id: userId,
        status: 'joined',
        actions_completed: 0,
        reward_eligibility: isActivated && profile?.identity_status === 'verified' ? 'pending' : 'not_eligible',
      });
      // Increment participant count
      await base44.entities.Campaign.update(campaignId, {
        participants: (campaign?.participants || 0) + 1,
      });
      base44.analytics.track({ eventName: 'campaign_joined', properties: { campaign_id: campaignId } });
    },
    onSuccess: () => { qc.invalidateQueries(['my-participations']); qc.invalidateQueries(['campaigns']); },
  });

  const completeMutation = useMutation({
    mutationFn: async ({ participationId, campaignId }) => {
      const participation = participations.find(p => p.id === participationId);
      const campaign = campaigns.find(c => c.id === campaignId);
      const newCount = (participation?.actions_completed || 0) + 1;
      const eligible = isActivated && profile?.identity_status === 'verified' ? 'eligible' : 'not_eligible';
      await base44.entities.CampaignParticipation.update(participationId, {
        actions_completed: newCount,
        status: 'in_progress',
        reward_eligibility: eligible,
        g_reward_amount: campaign?.reward_per_action_g || 5,
      });
      await base44.entities.Campaign.update(campaignId, {
        actions_completed: (campaign?.actions_completed || 0) + 1,
      });
      base44.analytics.track({ eventName: 'campaign_action_completed', properties: { campaign_id: campaignId, eligible } });
    },
    onSuccess: () => { qc.invalidateQueries(['my-participations']); qc.invalidateQueries(['campaigns']); },
  });

  const getParticipation = (campaignId) => participations.find(p => p.campaign_id === campaignId);

  const CATEGORY_COLORS = {
    Groceries: 'bg-emerald-100 text-emerald-700',
    Community: 'bg-blue-100 text-blue-700',
    Education: 'bg-purple-100 text-purple-700',
    Fuel: 'bg-amber-100 text-amber-700',
    default: 'bg-muted text-muted-foreground',
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBack title="Campaigns" />
      <div className="max-w-lg mx-auto px-6 pt-4 pb-8">
        {/* Header card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-5 mb-6 text-primary-foreground">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-5 h-5" />
            <p className="text-base font-bold">GoodDollar Campaigns</p>
          </div>
          <p className="text-sm opacity-90 mb-3">Complete verified actions and earn G$ rewards with community campaigns.</p>
          {!isActivated && (
            <button
              onClick={() => navigate('/gooddollar-activation')}
              className="text-xs bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-1.5 font-semibold"
            >
              Activate rewards to unlock G$ →
            </button>
          )}
        </div>

        {/* Milestone nudge banner — shown when 1-2 actions from next milestone */}
        {participations.length > 0 && (
          <MilestoneNudgeBanner participations={participations} campaigns={campaigns} />
        )}

        {/* Milestone progress widget */}
        {userId && <CampaignMilestoneWidget userId={userId} />}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />)}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No campaigns active right now. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map(campaign => {
              const participation = getParticipation(campaign.id);
              const joined = !!participation;
              const eligible = participation?.reward_eligibility === 'eligible';
              const catColor = CATEGORY_COLORS[campaign.category] || CATEGORY_COLORS.default;

              return (
                <div key={campaign.id} className="bg-white rounded-2xl border border-border overflow-hidden">
                  {/* Top */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {campaign.category && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${catColor}`}>
                              {campaign.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-foreground">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{campaign.description}</p>
                      </div>
                      {joined && (
                        <CampaignProgressCircle
                          actionsCompleted={participation?.actions_completed || 0}
                          targetActions={5}
                          rewardG={campaign.reward_per_action_g || 5}
                        />
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        <span>{campaign.participants || 0} joined</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{campaign.actions_completed || 0} actions</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-primary font-semibold ml-auto">
                        <Zap className="w-3.5 h-3.5" />
                        <span>G$ {campaign.reward_per_action_g || 5} / action</span>
                      </div>
                    </div>

                    {/* Reward eligibility badge */}
                    {joined && (
                      <div className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${eligible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {eligible ? <><CheckCircle2 className="w-3.5 h-3.5" /> Reward eligible</> : 'In progress'}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-5 pb-4 flex gap-2">
                    {!isAuth ? (
                      <Button size="sm" className="rounded-xl text-xs h-9" onClick={() => base44.auth.redirectToLogin()}>
                        Sign in to join
                      </Button>
                    ) : !joined ? (
                      <Button
                        size="sm"
                        className="rounded-xl text-xs h-9"
                        onClick={() => joinMutation.mutate(campaign.id)}
                        disabled={joinMutation.isPending}
                      >
                        {joinMutation.isPending ? 'Joining…' : 'Join campaign'}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs h-9"
                        onClick={() => completeMutation.mutate({ participationId: participation.id, campaignId: campaign.id })}
                        disabled={completeMutation.isPending}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {completeMutation.isPending ? 'Completing…' : 'Complete action'}
                      </Button>
                    )}
                    {!isActivated && (
                      <button
                        onClick={() => navigate('/gooddollar-activation')}
                        className="text-xs text-primary font-semibold flex items-center gap-1"
                      >
                        Activate for G$ <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center mt-6">
          G$ rewards require GoodDollar Rewards activation and identity verification. Estimates only.
        </p>
      </div>

      {/* Floating campaign guide agent */}
      <CampaignGuideChat />
    </div>
  );
}