import { ethers } from 'ethers';

// Celo Network Configuration
const CELO_RPC_URL = 'https://forno.celo.org';
const GOODDOLLAR_ADDRESSES = {
  // Mainnet addresses (Celo)
  G_TOKEN: '0x62b8B11552820a08Bb31983A18987d1efD6f6a0C',
  IDENTITY_ORACLE: '0x9C45A40D0988B80a9e8F9E0aF8f90a0a8D8D8D8D', // Placeholder - update with actual
  UBI_CONTRACT: '0x9D6289C04a8D8D8D8D8D8D8D8D8D8D8D8D8D8D8D' // Placeholder - update with actual
};

// ABI for G$ Token (ERC20)
const G_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)'
];

// ABI for Identity Oracle
const IDENTITY_ORACLE_ABI = [
  'function isVerified(address account) view returns (bool)',
  'function getIdentityStatus(address account) view returns (uint8)'
];

// ABI for UBI Contract
const UBI_CONTRACT_ABI = [
  'function canClaim(address account) view returns (bool)',
  'function lastClaimed(address account) view returns (uint256)',
  'function getDailyAmount() view returns (uint256)'
];

class GoodDollarBlockchainService {
  constructor() {
    this.provider = null;
    this.gTokenContract = null;
    this.identityOracle = null;
    this.ubiContract = null;
  }

  // Initialize connection to Celo network
  async initialize() {
    if (!this.provider) {
      this.provider = new ethers.JsonRpcProvider(CELO_RPC_URL);
      
      // Initialize contracts
      this.gTokenContract = new ethers.Contract(
        GOODDOLLAR_ADDRESSES.G_TOKEN,
        G_TOKEN_ABI,
        this.provider
      );
      
      // Note: Update with actual contract addresses when available
      // this.identityOracle = new ethers.Contract(
      //   GOODDOLLAR_ADDRESSES.IDENTITY_ORACLE,
      //   IDENTITY_ORACLE_ABI,
      //   this.provider
      // );
      
      // this.ubiContract = new ethers.Contract(
      //   GOODDOLLAR_ADDRESSES.UBI_CONTRACT,
      //   UBI_CONTRACT_ABI,
      //   this.provider
      // );
    }
    return this.provider;
  }

  // Fetch G$ balance for a wallet address
  async getGBalance(walletAddress) {
    try {
      await this.initialize();
      
      const balanceWei = await this.gTokenContract.balanceOf(walletAddress);
      const decimals = await this.gTokenContract.decimals();
      
      // Convert from wei to G$ (assuming 2 decimals for G$)
      const balance = parseFloat(ethers.formatUnits(balanceWei, decimals));
      
      return {
        success: true,
        balance: balance,
        formatted: `${balance.toFixed(2)} G$`,
        raw: balanceWei.toString()
      };
    } catch (error) {
      console.error('Error fetching G$ balance:', error);
      return {
        success: false,
        error: error.message,
        balance: 0
      };
    }
  }

  // Check identity verification status
  async getIdentityStatus(walletAddress) {
    try {
      await this.initialize();
      
      // Placeholder - implement when actual contract address is available
      // const status = await this.identityOracle.getIdentityStatus(walletAddress);
      // const isVerified = await this.identityOracle.isVerified(walletAddress);
      
      // For now, return mock structure
      return {
        success: true,
        isVerified: false, // Would be fetched from contract
        status: 'unknown',
        message: 'Identity oracle integration pending - contract address needed'
      };
    } catch (error) {
      console.error('Error fetching identity status:', error);
      return {
        success: false,
        error: error.message,
        isVerified: false,
        status: 'error'
      };
    }
  }

  // Check UBI claim eligibility
  async checkUBIClaim(walletAddress) {
    try {
      await this.initialize();
      
      // Placeholder - implement when actual contract address is available
      // const canClaim = await this.ubiContract.canClaim(walletAddress);
      // const lastClaimed = await this.ubiContract.lastClaimed(walletAddress);
      // const dailyAmount = await this.ubiContract.getDailyAmount();
      
      // For now, return mock structure
      return {
        success: true,
        canClaim: false, // Would be fetched from contract
        lastClaimed: null,
        dailyAmount: 0,
        message: 'UBI contract integration pending - contract address needed'
      };
    } catch (error) {
      console.error('Error checking UBI claim status:', error);
      return {
        success: false,
        error: error.message,
        canClaim: false
      };
    }
  }

  // Fetch complete profile from blockchain
  async fetchProfile(walletAddress) {
    try {
      const [balance, identity, ubi] = await Promise.all([
        this.getGBalance(walletAddress),
        this.getIdentityStatus(walletAddress),
        this.checkUBIClaim(walletAddress)
      ]);

      return {
        success: true,
        wallet_address: walletAddress,
        g_balance: balance.balance,
        identity_status: identity.isVerified ? 'verified' : 'unverified',
        ubi_claim_status: ubi.canClaim ? 'available' : 'not_eligible',
        last_synced_at: new Date().toISOString(),
        celo_network_status: 'connected',
        details: {
          balance,
          identity,
          ubi
        }
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error.message,
        celo_network_status: 'error'
      };
    }
  }

  // Validate wallet address format
  isValidAddress(address) {
    return ethers.isAddress(address);
  }

  // Format address for display (0x1234...5678)
  formatAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

// Export singleton instance
export const goodDollarBlockchain = new GoodDollarBlockchainService();
export default goodDollarBlockchain;