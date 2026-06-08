import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const { retailer_id, retailer_name, category, amount, payment_profiles, loyalty_cards, is_guest, country } = await req.json();

  // Fetch reward rules for this category, filtered by country if provided
  const allRules = await base44.asServiceRole.entities.RewardRule.filter({ active: true });
  const countryRules = country ? allRules.filter(r => !r.country || r.country === country) : allRules;
  const categoryRules = countryRules.filter(r => r.category === category);

  // Calculate estimated values for each payment profile + loyalty card combination
  const options = [];
  const reasonCodes = [];
  const missingProgrammes = [];

  // Get all loyalty programmes for this category
  const loyaltyRules = categoryRules.filter(r => {
    const progType = getProgrammeType(r.programme_name);
    return progType === 'loyalty';
  });
  const bankRules = categoryRules.filter(r => {
    const progType = getProgrammeType(r.programme_name);
    return progType === 'bank';
  });

  if (is_guest || !payment_profiles || payment_profiles.length === 0) {
    // Guest mode: show general estimates based on category rules
    const topBankRules = bankRules.sort((a, b) => b.estimated_rate_percent - a.estimated_rate_percent).slice(0, 4);
    const topLoyaltyRules = loyaltyRules.sort((a, b) => b.estimated_rate_percent - a.estimated_rate_percent).slice(0, 3);

    let rank = 1;
    for (const bankRule of topBankRules) {
      for (const loyaltyRule of topLoyaltyRules) {
        const combinedRate = bankRule.estimated_rate_percent + loyaltyRule.estimated_rate_percent;
        const estValue = Math.round((combinedRate / 100) * amount);
        options.push({
          payment_profile_name: bankRule.programme_name + " profile",
          loyalty_card_name: loyaltyRule.programme_name,
          estimated_value: estValue,
          confidence: "Low",
          rank: rank++,
          reason_codes: ["CATEGORY_MATCH", "NO_PAYMENT_PROFILE"]
        });
      }
    }
    // Also add bank-only options
    for (const bankRule of topBankRules) {
      const estValue = Math.round((bankRule.estimated_rate_percent / 100) * amount);
      options.push({
        payment_profile_name: bankRule.programme_name + " profile",
        loyalty_card_name: null,
        estimated_value: estValue,
        confidence: "Low",
        rank: rank++,
        reason_codes: ["CATEGORY_MATCH", "NO_MATCHING_LOYALTY_CARD"]
      });
    }

    options.sort((a, b) => b.estimated_value - a.estimated_value);
    options.forEach((o, i) => o.rank = i + 1);

    const best = options[0] || null;
    return Response.json({
      best_combo: best,
      options: options.slice(0, 8),
      estimated_value: best?.estimated_value || 0,
      confidence: "Low",
      reason_codes: ["NO_PAYMENT_PROFILE", "CATEGORY_MATCH"],
      missing_programmes: [],
      is_guest: true,
      disclaimers: ["Estimates only. Actual rewards may vary. Not financial advice."]
    });
  }

  // Signed-in user: calculate personalized combos
  const userLoyaltyNames = (loyalty_cards || []).map(lc => lc.programme_name);
  
  let rank = 1;
  for (const profile of payment_profiles) {
    // Find bank rules matching this profile's reward programme
    const matchingBankRules = bankRules.filter(r => 
      r.programme_name === profile.reward_programme || 
      r.programme_name === profile.bank_name
    );
    const bankRate = matchingBankRules.length > 0 
      ? Math.max(...matchingBankRules.map(r => r.estimated_rate_percent))
      : 1.0; // Conservative default
    const bankConfidence = matchingBankRules.length > 0 
      ? matchingBankRules[0].confidence_default 
      : "Low";
    
    const profileReasons = matchingBankRules.length > 0 
      ? ["PAYMENT_PROFILE_MATCH", "CATEGORY_MATCH"] 
      : ["CATEGORY_MATCH"];

    // Combine with each loyalty card
    for (const card of (loyalty_cards || [])) {
      const matchingLoyaltyRules = loyaltyRules.filter(r => r.programme_name === card.programme_name);
      const loyaltyRate = matchingLoyaltyRules.length > 0 
        ? Math.max(...matchingLoyaltyRules.map(r => r.estimated_rate_percent))
        : 0;
      const combinedRate = bankRate + loyaltyRate;
      const estValue = Math.round((combinedRate / 100) * amount);
      const confidence = getOverallConfidence(bankConfidence, matchingLoyaltyRules[0]?.confidence_default || "Low", profile.reward_level_known);

      const codes = [...profileReasons];
      if (matchingLoyaltyRules.length > 0) codes.push("LOYALTY_MATCH");
      if (estValue > 0) codes.push("HIGHER_ESTIMATED_VALUE");

      options.push({
        payment_profile_id: profile.id,
        payment_profile_name: profile.nickname || `${profile.bank_name} ${profile.product_tier || ''}`.trim(),
        loyalty_card_id: card.id,
        loyalty_card_name: card.programme_name,
        estimated_value: estValue,
        confidence,
        rank: rank++,
        reason_codes: codes
      });
    }

    // Also add bank-only option  
    const bankOnlyValue = Math.round((bankRate / 100) * amount);
    options.push({
      payment_profile_id: profile.id,
      payment_profile_name: profile.nickname || `${profile.bank_name} ${profile.product_tier || ''}`.trim(),
      loyalty_card_name: null,
      estimated_value: bankOnlyValue,
      confidence: bankConfidence,
      rank: rank++,
      reason_codes: [...profileReasons, "NO_MATCHING_LOYALTY_CARD"]
    });
  }

  options.sort((a, b) => b.estimated_value - a.estimated_value);
  options.forEach((o, i) => o.rank = i + 1);

  // Check for missing loyalty programmes
  for (const loyaltyRule of loyaltyRules) {
    if (!userLoyaltyNames.includes(loyaltyRule.programme_name)) {
      missingProgrammes.push(loyaltyRule.programme_name);
    }
  }

  const best = options[0] || null;
  const bestReasons = best?.reason_codes || [];
  if (missingProgrammes.length > 0) bestReasons.push("MISSING_PROGRAMME_OPPORTUNITY");
  if (best && !payment_profiles.some(p => p.reward_level_known)) bestReasons.push("TIER_UNKNOWN");

  return Response.json({
    best_combo: best,
    options: options.slice(0, 10),
    estimated_value: best?.estimated_value || 0,
    estimated_value_percentage: best ? ((best.estimated_value / amount) * 100).toFixed(1) : 0,
    confidence: best?.confidence || "Low",
    reason_codes: [...new Set(bestReasons)],
    missing_programmes: [...new Set(missingProgrammes)],
    is_guest: false,
    disclaimers: ["Estimates only. Actual rewards may vary based on your provider, reward tier, eligibility, caps, exclusions, and programme terms. SmartSpend does not provide financial advice."]
  });
});

function getProgrammeType(name) {
  // Retailer/loyalty programmes — not bank-issued
  const loyaltyKeywords = ["Xtra Savings", "Smart Shopper", "WRewards", "ClubCard", "Benefit", "Xpress", "Ster-Kinekor", "Dis-Chem", "Clicks"];
  const bankKeywords = ["eBucks", "Discovery Miles", "Absa Rewards", "UCount", "Greenbacks", "Live Better", "Investec Rewards", "Multiply", "Momentum"];
  if (bankKeywords.some(k => name.includes(k))) return "bank";
  if (loyaltyKeywords.some(k => name.includes(k))) return "loyalty";
  // Fallback: if provider is a known bank programme treat as bank, else loyalty
  return "loyalty";
}

function getOverallConfidence(bankConf, loyaltyConf, levelKnown) {
  const levels = { "High": 3, "Medium": 2, "Low": 1 };
  const avg = (levels[bankConf] + levels[loyaltyConf]) / 2;
  if (!levelKnown) return avg > 2 ? "Medium" : "Low";
  if (avg >= 2.5) return "High";
  if (avg >= 1.5) return "Medium";
  return "Low";
}