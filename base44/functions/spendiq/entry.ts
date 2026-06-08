import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  const { retailer_id, retailer_name, category, amount, payment_profiles, loyalty_cards, is_guest, country } = await req.json();

  // Fetch reward rules and programmes for this category, filtered by country
  const [allRules, allProgrammes] = await Promise.all([
    base44.asServiceRole.entities.RewardRule.filter({ active: true }),
    base44.asServiceRole.entities.RewardProgramme.filter({ active: true }),
  ]);

  // Build a map of programme_id -> type from RewardProgramme
  const progTypeMap = {};
  for (const p of allProgrammes) {
    progTypeMap[p.id] = p.type; // "bank", "loyalty", "retailer", "fuel", "other"
  }

  // Filter by country: only rules that match the selected country (strict — no country fallback)
  const countryRules = country ? allRules.filter(r => r.country === country) : allRules;
  const categoryRules = countryRules.filter(r => r.category === category);

  // Calculate estimated values for each payment profile + loyalty card combination
  const options = [];
  const reasonCodes = [];
  const missingProgrammes = [];

  // Classify rules using the RewardProgramme.type field; "bank" = card-based, everything else = loyalty/retailer
  const bankRules = categoryRules.filter(r => progTypeMap[r.programme_id] === 'bank');
  // For loyalty rules: include category-wide rules (no retailer_id) OR retailer-specific rules matching the current retailer
  const loyaltyRules = categoryRules.filter(r => 
    progTypeMap[r.programme_id] !== 'bank' &&
    (!r.retailer_id || !retailer_id || r.retailer_id === retailer_id)
  );

  // Check after country filtering if there are any relevant profiles
  const hasRelevantProfiles = !is_guest && payment_profiles?.length > 0 &&
    (() => {
      const names = new Set(bankRules.map(r => r.programme_name));
      return payment_profiles.some(p => names.has(p.reward_programme) || names.has(p.bank_name));
    })();

  if (!hasRelevantProfiles) {
    // Guest mode: show general estimates based on category rules (already filtered by country and retailer)
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

  // Only include payment profiles that have at least one bank rule in the target country
  const countryBankProgrammeNames = new Set(bankRules.map(r => r.programme_name));
  const relevantProfiles = payment_profiles.filter(p =>
    countryBankProgrammeNames.has(p.reward_programme) ||
    countryBankProgrammeNames.has(p.bank_name)
  );

  // Only include loyalty cards that have rules in the target country AND match the retailer (if retailer-specific)
  const countryLoyaltyProgrammeNames = new Set(loyaltyRules.map(r => r.programme_name));
  const relevantCards = (loyalty_cards || []).filter(c => {
    // Must have rules in target country
    if (!countryLoyaltyProgrammeNames.has(c.programme_name)) return false;
    // If user's card is retailer-specific (retailer_id matches), only include if it matches the current retailer
    if (c.retailer_id && retailer_id && c.retailer_id !== retailer_id) return false;
    return true;
  });

  let rank = 1;
  for (const profile of relevantProfiles) {
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

    // Combine with each loyalty card (country-filtered)
    for (const card of relevantCards) {
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


function getOverallConfidence(bankConf, loyaltyConf, levelKnown) {
  const levels = { "High": 3, "Medium": 2, "Low": 1 };
  const avg = (levels[bankConf] + levels[loyaltyConf]) / 2;
  if (!levelKnown) return avg > 2 ? "Medium" : "Low";
  if (avg >= 2.5) return "High";
  if (avg >= 1.5) return "Medium";
  return "Low";
}