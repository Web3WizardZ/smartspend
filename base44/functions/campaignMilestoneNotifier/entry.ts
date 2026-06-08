import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MILESTONES = [5, 10, 25, 50, 100];
const APP_URL = 'https://app.base44.com/apps/68326b8d12f48db726fba553'; // update with your published domain

function getNextMilestone(count) {
  return MILESTONES.find(m => m > count) || null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // Allow scheduled/entity automations (no user) and admin users; block regular users
  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const participations = await base44.asServiceRole.entities.CampaignParticipation.list();
  const campaigns = await base44.asServiceRole.entities.Campaign.filter({ active: true });
  const users = await base44.asServiceRole.entities.User.list();

  const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const notified = [];
  const skipped = [];

  for (const participation of participations) {
    const count = participation.actions_completed || 0;
    const nextMilestone = getNextMilestone(count);
    if (!nextMilestone) continue;

    const actionsNeeded = nextMilestone - count;
    if (actionsNeeded > 2) continue;

    // Debounce: skip if we already notified at this exact count
    if (participation.last_milestone_notified_count === count) {
      skipped.push({ reason: 'already_notified_at_this_count', userId: participation.user_id });
      continue;
    }

    const campaign = campaignMap[participation.campaign_id];
    if (!campaign) continue;

    const appUser = userMap[participation.user_id];
    if (!appUser?.email) {
      skipped.push({ reason: 'no_email', userId: participation.user_id });
      continue;
    }

    const rewardG = (campaign.reward_per_action_g || 5) * actionsNeeded;
    const subject = actionsNeeded === 1
      ? `🏆 One action away from your next reward milestone!`
      : `🎯 Just 2 actions left to hit your reward milestone!`;

    const body = `
Hi ${appUser.full_name || 'there'},

You're so close! You only need <strong>${actionsNeeded} more action${actionsNeeded > 1 ? 's' : ''}</strong> to hit your next SmartSpend campaign milestone of <strong>${nextMilestone} actions</strong>.

<strong>Campaign:</strong> ${campaign.name}
<strong>Your progress:</strong> ${count} / ${nextMilestone} actions
<strong>Potential G$ reward:</strong> G$ ${rewardG}

Complete your next action now to unlock your reward:
👉 <a href="${APP_URL}/campaigns">View your campaigns</a>

Keep up the great work!

— The SmartSpend Team
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: appUser.email,
      subject,
      body,
      from_name: 'SmartSpend',
    });

    // Mark this count as notified to prevent duplicate sends
    await base44.asServiceRole.entities.CampaignParticipation.update(participation.id, {
      last_milestone_notified_at: new Date().toISOString(),
      last_milestone_notified_count: count,
    });

    notified.push({ userId: appUser.id, email: appUser.email, campaign: campaign.name, actionsNeeded, nextMilestone });
  }

  return Response.json({
    success: true,
    notified: notified.length,
    skipped: skipped.length,
    details: notified,
  });
});