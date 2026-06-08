import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getGBalance, getIdentityStatus, getUBIClaimStatus } from '@/services/goodDollarService';

const GoodDollarContext = createContext(null);

export function GoodDollarProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [linking, setLinking] = useState(false);

  const loadProfile = useCallback(async () => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return;
    const me = await base44.auth.me();
    const profiles = await base44.entities.GoodDollarProfile.filter({ user_id: me.id });
    if (profiles.length > 0) {
      setProfile(profiles[0]);
    }
    // No auto-creation — profile is only created when the user explicitly links an address
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  /**
   * Link a GoodDollar address (the primary activation path).
   * Checks identity on-chain and saves the profile.
   */
  const connectAddress = useCallback(async (address) => {
    setLinking(true);
    const authed = await base44.auth.isAuthenticated();
    if (!authed) {
      setLinking(false);
      throw new Error('Please sign in to connect your GoodDollar account.');
    }
    const me = await base44.auth.me();

    let balance = 0, identity = 'unknown', ubi = 'unknown';
    try {
      [balance, identity, ubi] = await Promise.all([
        getGBalance(address),
        getIdentityStatus(address),
        getUBIClaimStatus(address),
      ]);
    } catch (e) {
      console.warn('GoodDollar on-chain sync failed (non-fatal):', e.message);
    }

    const existing = await base44.entities.GoodDollarProfile.filter({ user_id: me.id });
    const data = {
      user_id: me.id,
      wallet_address: address,
      wallet_type: 'external',
      activation_status: 'active',
      g_balance: balance,
      identity_status: identity,
      ubi_claim_status: ubi,
      celo_network_status: 'connected',
      last_synced_at: new Date().toISOString(),
    };

    const saved = existing.length > 0
      ? await base44.entities.GoodDollarProfile.update(existing[0].id, data)
      : await base44.entities.GoodDollarProfile.create(data);

    setProfile(saved);
    setLinking(false);

    base44.analytics.track({
      eventName: 'gooddollar_address_linked',
      properties: { identity_status: identity, ubi_claim_status: ubi },
    });

    return saved;
  }, []);

  /**
   * Sync G$ balance, identity, and UBI status from the network.
   */
  const sync = useCallback(async () => {
    if (!profile?.wallet_address) return;
    setSyncing(true);
    try {
      const [balance, identity, ubi] = await Promise.all([
        getGBalance(profile.wallet_address),
        getIdentityStatus(profile.wallet_address),
        getUBIClaimStatus(profile.wallet_address),
      ]);
      const updated = await base44.entities.GoodDollarProfile.update(profile.id, {
        g_balance: balance,
        identity_status: identity,
        ubi_claim_status: ubi,
        last_synced_at: new Date().toISOString(),
      });
      setProfile(updated);
    } catch (e) {
      console.warn('GoodDollar sync failed:', e.message);
    }
    setSyncing(false);
  }, [profile]);

  const isActivated = profile?.activation_status === 'active';
  const shortAddress = profile?.wallet_address
    ? `${profile.wallet_address.slice(0, 6)}...${profile.wallet_address.slice(-4)}`
    : null;

  return (
    <GoodDollarContext.Provider value={{
      profile,
      syncing,
      linking,
      isActivated,
      shortAddress,
      connectAddress,
      sync,
      reload: loadProfile,
    }}>
      {children}
    </GoodDollarContext.Provider>
  );
}

export function useGoodDollar() {
  const ctx = useContext(GoodDollarContext);
  if (!ctx) throw new Error('useGoodDollar must be used inside GoodDollarProvider');
  return ctx;
}