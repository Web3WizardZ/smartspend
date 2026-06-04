/**
 * Embedded Wallet Service — Celo Mainnet
 *
 * Creates Celo Mainnet wallets for users.
 * Wallet addresses are stored in localStorage per user.
 *
 * PRODUCTION NOTE: Replace createWalletForUser with a real embedded wallet provider
 * (Privy, Dynamic, Magic.link) to generate genuine Celo keypairs securely.
 * Current implementation generates a deterministic address for development/demo purposes.
 *
 * Network: Celo Mainnet (chainId: 42220)
 * RPC: https://forno.celo.org
 */

const WALLET_STORAGE_KEY = 'ss_embedded_wallet_v2'; // v2 = celo mainnet
const CELO_MAINNET = {
  chainId: 42220,
  name: 'Celo Mainnet',
  rpcUrl: 'https://forno.celo.org',
  explorerUrl: 'https://celoscan.io',
};

/**
 * Create (or retrieve) a Celo Mainnet wallet for a user.
 * Replace the address generation below with a real provider in production.
 */
export async function createWalletForUser(userId) {
  const existing = getStoredWallet(userId);
  if (existing) return existing;

  // PRODUCTION: Replace with real embedded wallet provider call
  // e.g. const wallet = await privyClient.createWallet({ userId, chain: 'celo' })
  const address = generateDeterministicAddress(userId);
  const wallet = {
    userId,
    walletAddress: address,
    walletType: 'embedded',
    chain: 'celo',
    chainId: CELO_MAINNET.chainId,
    network: CELO_MAINNET.name,
    provider: 'SmartSpend Embedded',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  storeWallet(userId, wallet);
  return wallet;
}

export async function getWalletForUser(userId) {
  return getStoredWallet(userId) || null;
}

export async function getWalletAddress(userId) {
  const wallet = await getWalletForUser(userId);
  return wallet?.walletAddress || null;
}

/**
 * Link an existing external Celo Mainnet wallet address.
 */
export async function linkExistingWallet(userId, walletAddress) {
  if (!isValidAddress(walletAddress)) {
    throw new Error('Invalid Celo wallet address format.');
  }
  const wallet = {
    userId,
    walletAddress,
    walletType: 'external',
    chain: 'celo',
    chainId: CELO_MAINNET.chainId,
    network: CELO_MAINNET.name,
    provider: 'External',
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  storeWallet(userId, wallet);
  return wallet;
}

export function getCeloExplorerUrl(address) {
  return `${CELO_MAINNET.explorerUrl}/address/${address}`;
}

// --- helpers ---

function generateDeterministicAddress(userId) {
  // Generates a valid-format Celo address deterministically from userId.
  // REPLACE in production with a real keypair from an embedded wallet provider.
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const filler = userId.replace(/[^a-f0-9]/gi, '0').slice(0, 32).padEnd(32, '0');
  return '0x' + (hex + filler).slice(0, 40);
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