import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MILESTONES = [5, 10, 25, 50, 100];

// Returns the next milestone above current count
function getNextMilestone(count) {
  return MILESTONES.find(m => m > count) || null;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  // This is a scheduled/admin function — verify admin or service context
  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch all active participations
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
    if (!nextMilestone) continue; // already hit max milestone

    const actionsNeeded = nextMilestone - count;

    // Only notify when user is exactly 1 or 2 actions away
    if (actionsNeeded > 2) continue;

    const campaign = campaignMap[participation.campaign_id];
    if (!campaign) continue;

    const appUser = userMap[participation.user_id];
    if (!appUser?.email) {
      skipped.push(participation.user_id);
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
👉 <a href="https://smartspend.app/campaigns">View your campaigns</a>

Keep up the great work!

— The SmartSpend Team
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: appUser.email,
      subject,
      body,
      from_name: 'SmartSpend',
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