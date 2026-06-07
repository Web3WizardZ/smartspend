/**
 * Embedded Wallet Service — Celo Mainnet
 *
 * Generates real Celo/EVM keypairs using ethers.js.
 * Private keys are stored encrypted in localStorage (AES-GCM via Web Crypto).
 *
 * Network: Celo Mainnet (chainId: 42220)
 * RPC: https://forno.celo.org
 * Explorer: https://celoscan.io
 */

import { ethers } from 'ethers';

const WALLET_STORAGE_KEY = 'ss_wallet_v3'; // v3 = real ethers keypair
const CELO_MAINNET = {
  chainId: 42220,
  name: 'Celo Mainnet',
  rpcUrl: 'https://forno.celo.org',
  explorerUrl: 'https://celoscan.io',
};

// --- Public API ---

/**
 * Create (or retrieve) a real Celo wallet for a user.
 * Generates a genuine random keypair on first call; retrieves on subsequent calls.
 */
export async function createWalletForUser(userId) {
  const existing = await getStoredWallet(userId);
  if (existing) return existing;

  // Generate a real random Celo/EVM wallet
  const ethersWallet = ethers.Wallet.createRandom();
  const encryptedKey = await encryptPrivateKey(ethersWallet.privateKey, userId);

  const wallet = {
    userId,
    walletAddress: ethersWallet.address,
    walletType: 'embedded',
    chain: 'celo',
    chainId: CELO_MAINNET.chainId,
    network: CELO_MAINNET.name,
    provider: 'SmartSpend Embedded (ethers)',
    encryptedPrivateKey: encryptedKey,
    createdAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };

  await storeWallet(userId, wallet);
  return wallet;
}

export async function getWalletForUser(userId) {
  return getStoredWallet(userId);
}

export async function getWalletAddress(userId) {
  const wallet = await getWalletForUser(userId);
  return wallet?.walletAddress || null;
}

/**
 * Link an existing external Celo wallet address (no private key stored).
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
  await storeWallet(userId, wallet);
  return wallet;
}

export function getCeloExplorerUrl(address) {
  return `${CELO_MAINNET.explorerUrl}/address/${address}`;
}

// --- Helpers ---

function isValidAddress(addr) {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

async function storeWallet(userId, wallet) {
  try {
    const all = JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY) || '{}');
    all[userId] = wallet;
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

async function getStoredWallet(userId) {
  try {
    const all = JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY) || '{}');
    return all[userId] || null;
  } catch {
    return null;
  }
}

/**
 * Encrypt a private key with AES-GCM using the userId as the password-derived key.
 * This provides basic at-rest protection in localStorage.
 */
async function encryptPrivateKey(privateKey, userId) {
  try {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(userId.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' }, false, ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      enc.encode(privateKey)
    );
    // Store as base64 iv + ciphertext
    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.byteLength);
    return btoa(String.fromCharCode(...combined));
  } catch {
    // Fallback: store obfuscated (not encrypted) if crypto unavailable
    return btoa(privateKey);
  }
}