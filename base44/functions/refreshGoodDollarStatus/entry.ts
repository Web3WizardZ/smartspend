import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const CELO_RPC = 'https://forno.celo.org';
const G_TOKEN_ADDRESS = '0x62B8B11039FcfE5aB0C56E502b1C372A3d462a4b';
const IDENTITY_CONTRACT = '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42';
const ERC20_BALANCE_OF = '0x70a08231';
const IDENTITY_IS_WHITELISTED = '0x3af32abf';

async function celoCall(to, data) {
  const res = await fetch(CELO_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'eth_call',
      params: [{ to, data }, 'latest'],
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  if (!json.result || json.result === '0x') return '0x0';
  return json.result;
}

function encodeAddress(address) {
  return address.replace('0x', '').padStart(64, '0');
}

async function getGBalance(walletAddress) {
  if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) return 0;
  const data = ERC20_BALANCE_OF + encodeAddress(walletAddress);
  const result = await celoCall(G_TOKEN_ADDRESS, data);
  const raw = BigInt(result);
  return Number(raw) / 100;
}

async function getIdentityStatus(walletAddress) {
  if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) return 'unknown';
  const data = IDENTITY_IS_WHITELISTED + encodeAddress(walletAddress);
  const result = await celoCall(IDENTITY_CONTRACT, data);
  const isVerified = BigInt(result) === 1n;
  return isVerified ? 'verified' : 'unverified';
}

async function getUBIClaimStatus(walletAddress) {
  if (!walletAddress || !/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) return 'unknown';
  const identity = await getIdentityStatus(walletAddress);
  return identity === 'verified' ? 'available' : 'not_eligible';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow admin to specify a user email for debugging
    const { user_email } = await req.json();
    let targetUser = user;
    
    if (user_email && user.role === 'admin') {
      const users = await base44.asServiceRole.entities.User.filter({ email: user_email });
      if (users.length === 0) {
        return Response.json({ error: 'User not found' }, { status: 404 });
      }
      targetUser = users[0];
    }

    const profiles = await base44.asServiceRole.entities.GoodDollarProfile.filter({ user_id: targetUser.id });
    
    if (profiles.length === 0) {
      return Response.json({ error: 'No GoodDollar profile found' }, { status: 404 });
    }

    const profile = profiles[0];
    
    if (!profile.wallet_address) {
      return Response.json({ error: 'No wallet address in profile' }, { status: 400 });
    }

    const [balance, identity, ubi] = await Promise.all([
      getGBalance(profile.wallet_address),
      getIdentityStatus(profile.wallet_address),
      getUBIClaimStatus(profile.wallet_address),
    ]);

    const updated = await base44.asServiceRole.entities.GoodDollarProfile.update(profile.id, {
      g_balance: balance,
      identity_status: identity,
      ubi_claim_status: ubi,
      last_synced_at: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      wallet_address: profile.wallet_address,
      g_balance: balance,
      identity_status: identity,
      ubi_claim_status: ubi,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});