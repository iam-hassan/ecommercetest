import {
  WALLET_CONNECTION_REQUEST,
  WALLET_CONNECTION_SUCCESS,
  WALLET_CONNECTION_FAILURE,
  WALLET_DISCONNECT,
  WALLET_NETWORK_CHANGED,
  WALLET_ACCOUNT_CHANGED,
  TRANSACTION_PENDING,
  TRANSACTION_SUCCESS,
  TRANSACTION_FAILURE,
  TRANSACTION_RESET
} from '../action/walletActions';

// Initial wallet state
const initialWalletState = {
  isConnected: false,
  isConnecting: false,
  address: null,
  balance: '0',
  networkId: null,
  networkName: null,
  provider: null,
  signer: null,
  error: null,
  isSupported: false
};

// Initial transaction state
const initialTransactionState = {
  isPending: false,
  isSuccess: false,
  isError: false,
  txHash: null,
  error: null,
  message: null,
  type: null // 'mint', 'transfer', etc.
};

// Wallet Reducer
export const walletReducer = (state = initialWalletState, action) => {
  switch (action.type) {
    case WALLET_CONNECTION_REQUEST:
      return {
        ...state,
        isConnecting: true,
        error: null
      };

    case WALLET_CONNECTION_SUCCESS:
      return {
        ...state,
        isConnecting: false,
        isConnected: true,
        address: action.payload.address,
        balance: action.payload.balance,
        networkId: action.payload.networkId,
        networkName: action.payload.networkName,
        provider: action.payload.provider,
        signer: action.payload.signer,
        error: null,
        isSupported: action.payload.networkId === 1 || action.payload.networkId === 137 || 
                    action.payload.networkId === 5 || action.payload.networkId === 80001
      };

    case WALLET_CONNECTION_FAILURE:
      return {
        ...state,
        isConnecting: false,
        isConnected: false,
        error: action.payload,
        address: null,
        balance: '0',
        networkId: null,
        networkName: null,
        provider: null,
        signer: null
      };

    case WALLET_DISCONNECT:
      return {
        ...initialWalletState
      };

    case WALLET_NETWORK_CHANGED:
      return {
        ...state,
        networkId: action.payload.networkId,
        networkName: action.payload.networkName,
        balance: action.payload.balance,
        provider: action.payload.provider,
        signer: action.payload.signer,
        isSupported: action.payload.networkId === 1 || action.payload.networkId === 137 || 
                    action.payload.networkId === 5 || action.payload.networkId === 80001,
        error: null
      };

    case WALLET_ACCOUNT_CHANGED:
      return {
        ...state,
        address: action.payload.address,
        balance: action.payload.balance,
        error: null
      };

    default:
      return state;
  }
};

// Transaction Reducer
export const transactionReducer = (state = initialTransactionState, action) => {
  switch (action.type) {
    case TRANSACTION_PENDING:
      return {
        ...state,
        isPending: true,
        isSuccess: false,
        isError: false,
        error: null,
        message: action.payload.message || 'Transaction pending...',
        type: action.payload.type || null
      };

    case TRANSACTION_SUCCESS:
      return {
        ...state,
        isPending: false,
        isSuccess: true,
        isError: false,
        txHash: action.payload.txHash,
        message: action.payload.message || 'Transaction successful!',
        error: null
      };

    case TRANSACTION_FAILURE:
      return {
        ...state,
        isPending: false,
        isSuccess: false,
        isError: true,
        error: action.payload,
        message: action.payload.message || 'Transaction failed!',
        txHash: null
      };

    case TRANSACTION_RESET:
      return {
        ...initialTransactionState
      };

    default:
      return state;
  }
};
