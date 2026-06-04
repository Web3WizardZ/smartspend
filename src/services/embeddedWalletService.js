/**
 * Embedded Wallet Service
 *
 * Abstracts wallet creation so users never see seed phrases, private keys, or MetaMask prompts.
 * Users sign up with Google/Email and a Celo-compatible wallet is prepared automatically.
 *
 * TODO: Replace mock with a production embedded wallet provider.
 *       Recommended options: Privy (privy.io), Dynamic (dynamic.xyz), Magic.link
 *       All support Celo, social login, and embedded/MPC wallets.
 * TODO: Ensure wallet is non-custodial or uses secure MPC/account abstraction.
 * TODO: Add secure key management and recovery flows.
 * TODO: Add production Celo network configuration.
 * TODO: Add transaction signing through the embedded wallet provider.
 */

const WALLET_STORAGE_KEY = 'ss_embedded_wallet';

/**
 * Create (or retrieve) an embedded Celo-compatible wallet for a user.
 * In production: delegate to Privy/Magic/Dynamic SDK.
 */
export async function createWalletForUser(userId) {
  await sleep(1200);
  // Check if already created this session
  const existing = getStoredWallet(userId);
  if (existing) return existing;

  // TODO: Replace with real embedded wallet provider call
  // e.g. const wallet = await privyClient.createWallet({ userId })
  const mockAddress = generateMockAddress(userId);
  const wallet = {
    userId,
    walletAddress: mockAddress,
    walletType: 'embedded',
    chain: 'celo',
    provider: 'SmartSpend Embedded', // TODO: Replace with real provider name
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  storeWallet(userId, wallet);
  return wallet;
}

export async function getWalletForUser(userId) {
  await sleep(300);
  return getStoredWallet(userId) || null;
}

export async function getWalletAddress(userId) {
  const wallet = await getWalletForUser(userId);
  return wallet?.walletAddress || null;
}

/**
 * Link an existing external wallet (for advanced users).
 * TODO: Validate the address on Celo network and link to the user profile.
 */
export async function linkExistingWallet(userId, walletAddress) {
  await sleep(500);
  if (!isValidAddress(walletAddress)) {
    throw new Error('Invalid wallet address format.');
  }
  const wallet = {
    userId,
    walletAddress,
    walletType: 'external',
    chain: 'celo',
    provider: 'External',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  storeWallet(userId, wallet);
  return wallet;
}

// --- helpers ---

function generateMockAddress(userId) {
  // Deterministic mock address based on userId
  // TODO: Remove — real provider generates real keypair
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return '0x' + hash.toString(16).padStart(4, '0') + userId.replace(/[^a-f0-9]/gi, '').slice(0, 36).padEnd(36, 'a');
}

function isValidAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

function storeWallet(userId, wallet) {
  try {
    const all = JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY) || '{}');
    all[userId] = wallet;
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

function getStoredWallet(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY) || '{}');
    return all[userId] || null;
  } catch { return null; }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}