import React from 'react';

export default function CampaignProgressCircle({ actionsCompleted = 0, targetActions = 5, rewardG = 5 }) {
  const pct = Math.min(actionsCompleted / targetActions, 1);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const done = pct >= 1;

  return (
    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <circle
            cx="28" cy="28" r={radius} fill="none"
            stroke={done ? 'hsl(var(--primary))' : 'hsl(var(--primary))'}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
            style={{ opacity: done ? 1 : 0.7 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-foreground leading-none">{actionsCompleted}</span>
          <span className="text-[9px] text-muted-foreground leading-none">/{targetActions}</span>
        </div>
      </div>
      <span className={`text-[9px] font-semibold ${done ? 'text-primary' : 'text-muted-foreground'}`}>
        {done ? '🎉 Done!' : `G$ ${rewardG}/action`}
      </span>
    </div>
  );
}