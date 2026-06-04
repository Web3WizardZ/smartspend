/**
 * GoodDollar Service Adapter
 *
 * TODO: Replace mock implementations with real GoodDollar SDK/API calls.
 * SDK docs: https://docs.gooddollar.org/for-developers/apis-and-sdks
 * GoodSdks: https://github.com/GoodDollar/GoodSdks
 *
 * This adapter pattern allows production swap without touching the rest of the app.
 */

// TODO: Replace with real Celo/GoodDollar network config
const CELO_CONFIG = {
  chainId: 42220,
  name: 'Celo',
  rpcUrl: 'https://forno.celo.org', // TODO: Use production RPC provider
  gTokenAddress: '0x62B8B11039FcfE5aB0C56E502b1C372A3d462a4b', // G$ on Celo
};

/**
 * Simulate fetching G$ balance for a wallet address.
 * TODO: Replace with real Celo token balance lookup via viem or ethers.js.
 * Example: const balance = await publicClient.readContract({ address: CELO_CONFIG.gTokenAddress, abi: erc20Abi, functionName: 'balanceOf', args: [walletAddress] })
 */
export async function getGBalance(walletAddress) {
  if (!walletAddress) return 0;
  // Mock: simulate a balance between 50 and 500 G$
  await sleep(800);
  const seed = walletAddress.charCodeAt(2) + walletAddress.charCodeAt(5);
  return Math.round((seed % 450) + 50);
}

/**
 * Check GoodDollar Identity (verified human) status.
 * TODO: Replace with GoodDollar Identity / Sybil Resistance API.
 * Docs: https://docs.gooddollar.org/about-the-protocol
 */
export async function getIdentityStatus(walletAddress) {
  if (!walletAddress) return 'unknown';
  await sleep(600);
  // Mock: addresses ending in even digit are "verified"
  const lastChar = walletAddress.slice(-1);
  const isEven = parseInt(lastChar, 16) % 2 === 0;
  return isEven ? 'verified' : 'unverified';
}

/**
 * Check UBI claim status for a wallet.
 * TODO: Replace with GoodDollar claim flow integration.
 * GoodDAPP: https://github.com/GoodDollar/GoodProtocolUI
 */
export async function getUBIClaimStatus(walletAddress) {
  if (!walletAddress) return 'unknown';
  await sleep(500);
  const options = ['available', 'claimed', 'not_eligible'];
  const seed = walletAddress.charCodeAt(3) % 3;
  return options[seed];
}

/**
 * Simulate claiming UBI.
 * TODO: Replace with real GoodDollar UBI claim transaction on Celo.
 */
export async function claimUBI(walletAddress) {
  await sleep(1500);
  return { success: true, amount: 7.5, txHash: '0xmock_tx_' + Date.now() };
}

/**
 * Check if a user is eligible for a G$ reward based on an action.
 * TODO: Replace mock campaign reward logic with GoodCollective integration.
 * GoodCollective: https://github.com/GoodDollar/GoodCollective
 */
export async function checkRewardEligibility(walletAddress, actionId, identityStatus) {
  await sleep(400);
  if (!walletAddress) return { eligible: false, reason: 'no_wallet' };
  if (identityStatus !== 'verified') return { eligible: false, reason: 'identity_required' };
  return { eligible: true, estimatedReward: 5, reason: 'action_eligible' };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}