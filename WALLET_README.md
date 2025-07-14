# Blockchain Wallet Integration

This ecommerce application includes a comprehensive blockchain wallet integration system that provides real-time wallet connections, network detection, and transaction state management.

## Features

### 1. Wallet Connection Management
- **MetaMask Integration**: Seamless connection to MetaMask wallet
- **Auto-reconnection**: Automatically reconnects to previously connected wallets
- **Connection State Persistence**: Maintains connection state across browser sessions
- **Real-time Address Display**: Shows formatted wallet address (0x1234...5678)
- **Balance Updates**: Real-time balance updates when transactions occur

### 2. Network Detection & Management
- **Multi-chain Support**: 
  - Ethereum Mainnet (Chain ID: 1)
  - Polygon Mainnet (Chain ID: 137)
  - Goerli Testnet (Chain ID: 5)
  - Polygon Mumbai Testnet (Chain ID: 80001)
- **Network Switching**: One-click network switching with automatic wallet prompts
- **Unsupported Network Detection**: Alerts users when connected to unsupported networks
- **Real-time Network Changes**: Automatically detects and updates UI when users switch networks

### 3. Transaction Lifecycle Management
- **Pending State**: Shows spinners and "Confirm in wallet" messages
- **Success Notifications**: Displays success messages with transaction hash links
- **Error Handling**: Comprehensive error messages for failed transactions
- **Transaction History**: Links to blockchain explorers for transaction verification

### 4. UI State Synchronization
- **Real-time Updates**: UI instantly reflects wallet state changes
- **Responsive Design**: Mobile-friendly wallet interface
- **Toast Notifications**: Non-intrusive notifications for wallet events
- **Loading States**: Visual feedback during connection and transaction processes

## Architecture

### Redux State Management
The wallet state is managed through Redux with the following structure:

```javascript
{
  wallet: {
    isConnected: boolean,
    isConnecting: boolean,
    address: string,
    balance: string,
    networkId: number,
    networkName: string,
    provider: object,
    signer: object,
    error: string,
    isSupported: boolean
  },
  transaction: {
    isPending: boolean,
    isSuccess: boolean,
    isError: boolean,
    txHash: string,
    error: string,
    message: string,
    type: string
  }
}
```

### Event Listeners
The system implements real-time event listeners for:

1. **Account Changes** (`accountsChanged`):
   - Detects when users switch accounts in MetaMask
   - Updates address and balance automatically
   - Handles disconnection when no accounts are available

2. **Network Changes** (`chainChanged`):
   - Detects network switching in real-time
   - Updates network information and balance
   - Validates network support

### Network Detection Implementation

```javascript
// Listen for network changes
window.ethereum.on('chainChanged', async (chainId) => {
  const networkId = parseInt(chainId, 16);
  const networkName = SUPPORTED_NETWORKS[networkId]?.name || 'Unknown Network';
  
  // Update provider and get new balance
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  const balance = await provider.getBalance(address);
  
  dispatch({
    type: WALLET_NETWORK_CHANGED,
    payload: { networkId, networkName, balance: ethers.utils.formatEther(balance) }
  });
});
```

### Transaction State Synchronization

The transaction lifecycle follows these states:

1. **Initiation**: User clicks transaction button
   ```javascript
   dispatch(startTransaction({
     type: 'mint',
     message: 'Preparing transaction...'
   }));
   ```

2. **Pending**: Transaction submitted to blockchain
   ```javascript
   // Show "Confirm in wallet" message
   dispatch(startTransaction({
     type: 'mint',
     message: 'Please confirm transaction in your wallet...'
   }));
   ```

3. **Confirmation**: Transaction confirmed
   ```javascript
   const receipt = await tx.wait();
   dispatch(transactionSuccess({
     txHash: receipt.transactionHash,
     message: 'NFT minted successfully!'
   }));
   ```

4. **Error Handling**: Transaction failed
   ```javascript
   dispatch(transactionFailure({
     error: 'Transaction failed: Insufficient funds'
   }));
   ```

## Components

### WalletConnector Component
- Located in: `src/components/WalletConnector.jsx`
- Provides connection/disconnection interface
- Displays wallet status and network information
- Handles network switching

### WalletProvider Component
- Located in: `src/components/WalletProvider.jsx`
- Wraps the entire application
- Handles auto-connection on page load
- Sets up global event listeners

### useBlockchainTransaction Hook
- Located in: `src/hooks/useBlockchainTransaction.js`
- Provides transaction execution with UI state management
- Handles common transaction patterns (send, mint, approve)
- Manages transaction lifecycle states

## Usage Examples

### Basic Wallet Connection
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { connectWallet } from '../redux/action/walletActions';

const MyComponent = () => {
  const wallet = useSelector(state => state.wallet);
  const dispatch = useDispatch();

  const handleConnect = () => {
    dispatch(connectWallet());
  };

  return (
    <div>
      {wallet.isConnected ? (
        <p>Connected: {wallet.address}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
};
```

### Transaction Execution
```javascript
import useBlockchainTransaction from '../hooks/useBlockchainTransaction';

const MyComponent = () => {
  const { mintNFT, isTransactionPending } = useBlockchainTransaction();

  const handleMint = async () => {
    try {
      await mintNFT(contractAddress, abi, mintPrice);
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  return (
    <button onClick={handleMint} disabled={isTransactionPending}>
      {isTransactionPending ? 'Minting...' : 'Mint NFT'}
    </button>
  );
};
```

## Integration Points

### Navbar Integration
The wallet connector is integrated into the main navigation bar, providing users with immediate access to wallet functionality from any page.

### E-commerce Integration
The wallet system can be extended to support:
- **Crypto Payments**: Accept ETH/MATIC for product purchases
- **NFT Products**: Sell digital collectibles
- **Token Gating**: Restrict access based on token ownership
- **Loyalty Tokens**: Reward customers with blockchain-based loyalty points

## Security Considerations

1. **User Consent**: All transactions require explicit user confirmation
2. **Network Validation**: Only approved networks are marked as supported
3. **Error Handling**: Comprehensive error messages prevent user confusion
4. **No Private Key Storage**: The application never stores or requests private keys

## Browser Compatibility

- **MetaMask**: Full support for MetaMask browser extension
- **WalletConnect**: Can be extended to support WalletConnect protocol
- **Mobile Wallets**: Compatible with mobile wallet apps through WalletConnect

## Future Enhancements

1. **Multi-wallet Support**: Add support for Coinbase Wallet, WalletConnect
2. **ENS Integration**: Support Ethereum Name Service for human-readable addresses
3. **Token Balance Display**: Show ERC-20 token balances
4. **Transaction History**: Local storage of transaction history
5. **Gas Estimation**: Show estimated gas costs before transactions
6. **Batch Transactions**: Support for multiple transactions in one batch

## Troubleshooting

### Common Issues

1. **MetaMask Not Detected**
   - Ensure MetaMask extension is installed
   - Refresh the page after installing MetaMask

2. **Network Not Supported**
   - Switch to Ethereum or Polygon networks
   - Use the network switcher in the wallet component

3. **Transaction Failures**
   - Check wallet balance for sufficient funds
   - Verify contract address and parameters
   - Try increasing gas limit manually in MetaMask

## Development Setup

1. Install dependencies:
   ```bash
   npm install ethers @reduxjs/toolkit
   ```

2. Import wallet components in your application:
   ```javascript
   import WalletProvider from './components/WalletProvider';
   import WalletConnector from './components/WalletConnector';
   ```

3. Wrap your app with WalletProvider:
   ```javascript
   <WalletProvider>
     <App />
   </WalletProvider>
   ```

## API Reference

### Actions
- `connectWallet()` - Connect to MetaMask wallet
- `disconnectWallet()` - Disconnect wallet
- `switchNetwork(networkId)` - Switch to specified network
- `startTransaction(data)` - Start transaction with pending state
- `transactionSuccess(result)` - Mark transaction as successful
- `transactionFailure(error)` - Mark transaction as failed

### Selectors
- `state.wallet.isConnected` - Boolean wallet connection status
- `state.wallet.address` - Current wallet address
- `state.wallet.balance` - Current wallet balance
- `state.wallet.networkId` - Current network ID
- `state.transaction.isPending` - Boolean transaction pending status
