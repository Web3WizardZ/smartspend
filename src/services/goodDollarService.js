/**
 * GoodDollar Service — Celo Mainnet (Frontend)
 *
 * Uses public Celo Mainnet RPC (forno.celo.org) to read live on-chain data.
 * G$ token: 0x62B8B11039FcfE5aB0C56E502b1C372A3d462a4b (Celo Mainnet)
 * GoodDollar Identity contract: 0xC361A6E67822a0EDc17D899227dd9FC50BD62F42
 */

const CELO_RPC = 'https://forno.celo.org';
const G_TOKEN_ADDRESS = '0x62B8B11039FcfE5aB0C56E502b1C372A3d462a4b';
const IDENTITY_CONTRACT = '0xC361A6E67822a0EDc17D899227dd9FC50BD62F42';

// Minimal ABI selectors for eth_call
const ERC20_BALANCE_OF = '0x70a08231'; // balanceOf(address)
const IDENTITY_IS_WHITELISTED = '0x3af32abf'; // isWhitelisted(address)

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
  return json.result;
}

function encodeAddress(address) {
  // Pad address to 32 bytes
  return address.replace('0x', '').padStart(64, '0');
}

/**
 * Fetch live G$ balance from Celo Mainnet (returns value in G$, 2 decimals).
 */
export async function getGBalance(walletAddress) {
  if (!walletAddress || !isValidAddress(walletAddress)) return 0;
  const data = ERC20_BALANCE_OF + encodeAddress(walletAddress);
  const result = await celoCall(G_TOKEN_ADDRESS, data);
  const raw = BigInt(result);
  // G$ has 2 decimal places
  return Number(raw) / 100;
}

/**
 * Check GoodDollar identity (sybil-resistance) status on Celo Mainnet.
 * Uses the GoodDollar IdentityV2 contract isWhitelisted() call.
 */
export async function getIdentityStatus(walletAddress) {
  if (!walletAddress || !isValidAddress(walletAddress)) return 'unknown';
  const data = IDENTITY_IS_WHITELISTED + encodeAddress(walletAddress);
  const result = await celoCall(IDENTITY_CONTRACT, data);
  const isVerified = BigInt(result) === 1n;
  return isVerified ? 'verified' : 'unverified';
}

/**
 * UBI claim status — requires GoodDollar wallet/DAPP integration for claiming.
 * For now returns 'available' for verified wallets, 'unknown' otherwise.
 * Full claim flow: https://gooddapp.gooddollar.org
 */
export async function getUBIClaimStatus(walletAddress) {
  if (!walletAddress || !isValidAddress(walletAddress)) return 'unknown';
  const identity = await getIdentityStatus(walletAddress);
  return identity === 'verified' ? 'available' : 'not_eligible';
}

/**
 * UBI claiming requires a signed transaction via the user's wallet.
 * Redirects to GoodDapp for the claim flow.
 */
export async function claimUBI(walletAddress) {
  window.open(`https://gooddapp.gooddollar.org/#/claim`, '_blank');
  return { success: true, redirected: true };
}

/**
 * Check G$ reward eligibility for a spend action.
 */
export async function checkRewardEligibility(walletAddress, actionId, identityStatus) {
  if (!walletAddress) return { eligible: false, reason: 'no_wallet' };
  if (identityStatus !== 'verified') return { eligible: false, reason: 'identity_required' };
  return { eligible: true, estimatedReward: 5, reason: 'action_eligible' };
}

function isValidAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

export function formatAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}