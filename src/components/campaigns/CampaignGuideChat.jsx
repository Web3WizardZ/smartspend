import React from 'react';
import { MessageCircle } from 'lucide-react';
import AgentChatWidget from '@/components/shared/AgentChatWidget';

export default function CampaignGuideChat() {
  return (
    <AgentChatWidget
      agentName="campaign_guide"
      title="Campaign Guide"
      triggerIcon={<MessageCircle className="w-6 h-6" />}
      placeholder="Ask about campaigns…"
      emptyMessage="Ask me about active campaigns, your progress, or how to earn G$ rewards!"
      fabClassName="bg-primary text-primary-foreground hover:bg-primary/90"
    />
  );
}