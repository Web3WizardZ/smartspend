import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { createWalletForUser, getWalletForUser, linkExistingWallet } from '@/services/embeddedWalletService';
import { getGBalance, getIdentityStatus, getUBIClaimStatus } from '@/services/goodDollarService';

const GoodDollarContext = createContext(null);

export function GoodDollarProvider({ children }) {
  const [profile, setProfile] = useState(null); // GoodDollarProfile entity record
  const [wallet, setWallet] = useState(null);   // embeddedWalletService result
  const [syncing, setSyncing] = useState(false);
  const [activating, setActivating] = useState(false);

  // Load profile from DB for the current user.
  // On first login, auto-creates a Celo wallet and GoodDollarProfile.
  const loadProfile = useCallback(async () => {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return;
    const me = await base44.auth.me();

    // Always ensure a wallet exists for authenticated users
    const w = await createWalletForUser(me.id);
    setWallet(w);

    const profiles = await base44.entities.GoodDollarProfile.filter({ user_id: me.id });
    if (profiles.length > 0) {
      // Sync wallet address if it changed (e.g. user re-installs)
      const p = profiles[0];
      if (!p.wallet_address && w?.walletAddress) {
        const updated = await base44.entities.GoodDollarProfile.update(p.id, {
          wallet_address: w.walletAddress,
          wallet_type: w.walletType,
        });
        setProfile(updated);
      } else {
        setProfile(p);
      }
    } else {
      // First login: create a profile with the new wallet (inactive until user activates G$)
      const created = await base44.entities.GoodDollarProfile.create({
        user_id: me.id,
        wallet_address: w.walletAddress,
        wallet_type: w.walletType,
        activation_status: 'inactive',
        celo_network_status: 'connected',
      });
      setProfile(created);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  /**
   * Activate GoodDollar Rewards for the current user.
   * Creates/retrieves embedded wallet and a GoodDollarProfile record.
   */
  const activate = useCallback(async () => {
    setActivating(true);
    const me = await base44.auth.me();

    // Step 1: Create embedded wallet
    const w = await createWalletForUser(me.id);
    setWallet(w);

    // Step 2: Fetch on-chain data (best-effort — don't fail activation if RPC is down)
    let balance = 0, identity = 'unknown', ubi = 'unknown';
    try {
      [balance, identity, ubi] = await Promise.all([
        getGBalance(w.walletAddress),
        getIdentityStatus(w.walletAddress),
        getUBIClaimStatus(w.walletAddress),
      ]);
    } catch (e) {
      console.warn('GoodDollar on-chain sync failed (non-fatal):', e.message);
    }

    // Step 3: Upsert GoodDollarProfile entity
    const existing = await base44.entities.GoodDollarProfile.filter({ user_id: me.id });
    const profileData = {
      user_id: me.id,
      wallet_address: w.walletAddress,
      wallet_type: w.walletType,
      activation_status: 'active',
      g_balance: balance,
      identity_status: identity,
      ubi_claim_status: ubi,
      celo_network_status: 'connected',
      last_synced_at: new Date().toISOString(),
    };

    let saved;
    if (existing.length > 0) {
      saved = await base44.entities.GoodDollarProfile.update(existing[0].id, profileData);
    } else {
      saved = await base44.entities.GoodDollarProfile.create(profileData);
    }
    setProfile(saved);
    setActivating(false);

    base44.analytics.track({ eventName: 'gooddollar_rewards_activated', properties: { identity_status: identity, ubi_claim_status: ubi } });
    return saved;
  }, []);

  /**
   * Sync G$ balance, identity, and UBI status from the network.
   */
  const sync = useCallback(async () => {
    if (!profile?.wallet_address) return;
    setSyncing(true);
    let balance = profile.g_balance || 0, identity = profile.identity_status || 'unknown', ubi = profile.ubi_claim_status || 'unknown';
    try {
      [balance, identity, ubi] = await Promise.all([
        getGBalance(profile.wallet_address),
        getIdentityStatus(profile.wallet_address),
        getUBIClaimStatus(profile.wallet_address),
      ]);
    } catch (e) {
      console.warn('GoodDollar sync failed:', e.message);
      setSyncing(false);
      return;
    }
    const updated = await base44.entities.GoodDollarProfile.update(profile.id, {
      g_balance: balance,
      identity_status: identity,
      ubi_claim_status: ubi,
      last_synced_at: new Date().toISOString(),
    });
    setProfile(updated);
    setSyncing(false);
  }, [profile]);

  /**
   * Link an existing external wallet (advanced users).
   */
  const connectExternalWallet = useCallback(async (address) => {
    const me = await base44.auth.me();
    const w = await linkExistingWallet(me.id, address);
    setWallet(w);
    const [balance, identity, ubi] = await Promise.all([
      getGBalance(address),
      getIdentityStatus(address),
      getUBIClaimStatus(address),
    ]);
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
  }, []);

  const isActivated = profile?.activation_status === 'active';
  const shortAddress = profile?.wallet_address
    ? `${profile.wallet_address.slice(0, 6)}...${profile.wallet_address.slice(-4)}`
    : null;

  return (
    <GoodDollarContext.Provider value={{
      profile,
      wallet,
      syncing,
      activating,
      isActivated,
      shortAddress,
      activate,
      sync,
      connectExternalWallet,
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