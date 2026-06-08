import React from 'react';
import { Sparkles } from 'lucide-react';
import AgentChatWidget from '@/components/shared/AgentChatWidget';

export default function RewardsStrategyChat() {
  return (
    <AgentChatWidget
      agentName="rewards_strategy"
      title="Rewards Advisor"
      triggerIcon={<Sparkles className="w-6 h-6" />}
      placeholder="Which store are you visiting?"
      emptyMessage="Tell me where you're shopping and how much you plan to spend — I'll find your best rewards combo!"
      fabClassName="bg-amber-500 text-white hover:bg-amber-600"
    />
  );
}