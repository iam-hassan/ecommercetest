import { ethers } from 'ethers';

// Action Types
export const WALLET_CONNECTION_REQUEST = 'WALLET_CONNECTION_REQUEST';
export const WALLET_CONNECTION_SUCCESS = 'WALLET_CONNECTION_SUCCESS';
export const WALLET_CONNECTION_FAILURE = 'WALLET_CONNECTION_FAILURE';
export const WALLET_DISCONNECT = 'WALLET_DISCONNECT';
export const WALLET_NETWORK_CHANGED = 'WALLET_NETWORK_CHANGED';
export const WALLET_ACCOUNT_CHANGED = 'WALLET_ACCOUNT_CHANGED';

// Transaction States
export const TRANSACTION_PENDING = 'TRANSACTION_PENDING';
export const TRANSACTION_SUCCESS = 'TRANSACTION_SUCCESS';
export const TRANSACTION_FAILURE = 'TRANSACTION_FAILURE';
export const TRANSACTION_RESET = 'TRANSACTION_RESET';

// Supported Networks
export const SUPPORTED_NETWORKS = {
  1: {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io/',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
  },
  137: {
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com/',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  },
  5: {
    name: 'Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/',
    blockExplorer: 'https://goerli.etherscan.io/',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
  },
  80001: {
    name: 'Polygon Mumbai',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
    blockExplorer: 'https://mumbai.polygonscan.com/',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }
  }
};

// Connect Wallet Action
export const connectWallet = () => async (dispatch) => {
  try {
    dispatch({ type: WALLET_CONNECTION_REQUEST });

    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (accounts.length === 0) {
      throw new Error('No accounts found. Please check your wallet connection.');
    }

    // Get network information
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const networkId = parseInt(chainId, 16);

    // Create provider and get balance
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = accounts[0];
    const balance = await provider.getBalance(address);
    const formattedBalance = ethers.utils.formatEther(balance);

    const walletData = {
      address,
      balance: formattedBalance,
      networkId,
      networkName: SUPPORTED_NETWORKS[networkId]?.name || 'Unknown Network',
      isConnected: true
      // Do NOT store provider or signer in Redux state
    };

    dispatch({
      type: WALLET_CONNECTION_SUCCESS,
      payload: walletData
    });
    // Clear disconnect flag on successful connect
    localStorage.removeItem('wallet_disconnected');

    // Set up event listeners for account and network changes
    setupWalletListeners(dispatch);

    return walletData;
  } catch (error) {
    dispatch({
      type: WALLET_CONNECTION_FAILURE,
      payload: error.message
    });
    throw error;
  }
};

// Disconnect Wallet Action
export const disconnectWallet = () => (dispatch) => {
  dispatch({ type: WALLET_DISCONNECT });
  // Set flag to prevent auto-connect
  localStorage.setItem('wallet_disconnected', '1');
  // Remove event listeners
  if (window.ethereum && window.ethereum.removeAllListeners) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// Setup Event Listeners
const setupWalletListeners = (dispatch) => {
  if (!window.ethereum) return;

  // Listen for account changes
  window.ethereum.on('accountsChanged', async (accounts) => {
    if (accounts.length === 0) {
      dispatch({ type: WALLET_DISCONNECT });
    } else {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(accounts[0]);
        const formattedBalance = ethers.utils.formatEther(balance);
        
        dispatch({
          type: WALLET_ACCOUNT_CHANGED,
          payload: {
            address: accounts[0],
            balance: formattedBalance
          }
        });
      } catch (error) {
        console.error('Error updating account:', error);
      }
    }
  });

  // Listen for network changes
  window.ethereum.on('chainChanged', async (chainId) => {
    const networkId = parseInt(chainId, 16);
    const networkName = SUPPORTED_NETWORKS[networkId]?.name || 'Unknown Network';
    
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.utils.formatEther(balance);

      dispatch({
        type: WALLET_NETWORK_CHANGED,
        payload: {
          networkId,
          networkName,
          balance: formattedBalance,
          provider,
          signer
        }
      });
    } catch (error) {
      console.error('Error updating network:', error);
    }
  });
};

// Switch Network Action
export const switchNetwork = (networkId) => async (dispatch) => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const chainId = `0x${networkId.toString(16)}`;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        const networkConfig = SUPPORTED_NETWORKS[networkId];
        if (networkConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId,
              chainName: networkConfig.name,
              rpcUrls: [networkConfig.rpcUrl],
              blockExplorerUrls: [networkConfig.blockExplorer],
              nativeCurrency: networkConfig.nativeCurrency
            }],
          });
        }
      } else {
        throw switchError;
      }
    }
  } catch (error) {
    console.error('Failed to switch network:', error);
    throw error;
  }
};

// Transaction Actions
export const startTransaction = (transactionData) => ({
  type: TRANSACTION_PENDING,
  payload: transactionData
});

export const transactionSuccess = (result) => ({
  type: TRANSACTION_SUCCESS,
  payload: result
});

export const transactionFailure = (error) => ({
  type: TRANSACTION_FAILURE,
  payload: error
});

export const resetTransaction = () => ({
  type: TRANSACTION_RESET
});

// Auto-connect on page load if previously connected
export const autoConnectWallet = () => async (dispatch) => {
  try {
    if (typeof window.ethereum === 'undefined') return;
    // Only auto-connect if user hasn't manually disconnected
    if (localStorage.getItem('wallet_disconnected') === '1') return;
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      // User was previously connected, auto-connect
      await dispatch(connectWallet());
    }
  } catch (error) {
    console.error('Auto-connect failed:', error);
  }
};

// Get network info
export const getNetworkInfo = (networkId) => {
  return SUPPORTED_NETWORKS[networkId] || {
    name: 'Unknown Network',
    rpcUrl: '',
    blockExplorer: '',
    nativeCurrency: { name: 'Unknown', symbol: '?', decimals: 18 }
  };
};
