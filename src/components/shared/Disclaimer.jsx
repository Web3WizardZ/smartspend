import React from 'react';

export default function Disclaimer({ short }) {
  return (
    <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-4">
      {short
        ? "Estimates only. Actual rewards may vary. Not financial advice."
        : "Estimates only. Actual rewards may vary based on your provider, reward tier, eligibility, caps, exclusions, and programme terms. SmartSpend does not provide financial advice."}
    </p>
  );
}