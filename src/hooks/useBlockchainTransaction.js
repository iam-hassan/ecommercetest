import { useDispatch, useSelector } from 'react-redux';
import { ethers } from 'ethers';
import { 
  startTransaction, 
  transactionSuccess, 
  transactionFailure, 
  resetTransaction 
} from '../redux/action/walletActions';

/**
 * Custom hook for handling blockchain transactions with UI state management
 */
export const useBlockchainTransaction = () => {
  const dispatch = useDispatch();
  const wallet = useSelector(state => state.wallet);
  const transaction = useSelector(state => state.transaction);

  /**
   * Execute a blockchain transaction with proper UI state management
   * @param {Object} params - Transaction parameters
   * @param {Function} params.transactionFn - Function that returns a transaction promise
   * @param {string} params.type - Type of transaction (e.g., 'mint', 'transfer', 'approve')
   * @param {string} params.pendingMessage - Message to show during pending state
   * @param {string} params.successMessage - Message to show on success
   * @param {Object} params.onSuccess - Callback function on successful transaction
   * @param {Object} params.onError - Callback function on transaction error
   */
  const executeTransaction = async ({
    transactionFn,
    type = 'transaction',
    pendingMessage = 'Processing transaction...',
    successMessage = 'Transaction completed successfully!',
    onSuccess,
    onError
  }) => {
    if (!wallet.isConnected || !wallet.signer) {
      dispatch(transactionFailure('Wallet not connected'));
      return;
    }

    try {
      // Start transaction - show pending state
      dispatch(startTransaction({
        type,
        message: pendingMessage
      }));

      // Execute the transaction function
      const tx = await transactionFn(wallet.signer);
      
      // Update pending message to include tx hash
      dispatch(startTransaction({
        type,
        message: 'Transaction submitted, waiting for confirmation...'
      }));

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Transaction successful
      dispatch(transactionSuccess({
        txHash: receipt.transactionHash,
        message: successMessage,
        type
      }));

      // Execute success callback if provided
      if (onSuccess) {
        onSuccess(receipt);
      }

      return receipt;

    } catch (error) {
      console.error('Transaction failed:', error);
      
      // Parse error message
      let errorMessage = 'Transaction failed';
      
      if (error.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.code === -32603) {
        errorMessage = 'Internal JSON-RPC error';
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(transactionFailure(errorMessage));

      // Execute error callback if provided
      if (onError) {
        onError(error);
      }

      throw error;
    }
  };

  /**
   * Send ETH/MATIC to another address
   */
  const sendNativeToken = async (toAddress, amount) => {
    return executeTransaction({
      transactionFn: async (signer) => {
        const tx = await signer.sendTransaction({
          to: toAddress,
          value: ethers.utils.parseEther(amount.toString())
        });
        return tx;
      },
      type: 'transfer',
      pendingMessage: `Sending ${amount} ${wallet.networkId === 137 ? 'MATIC' : 'ETH'}...`,
      successMessage: `Successfully sent ${amount} ${wallet.networkId === 137 ? 'MATIC' : 'ETH'}!`
    });
  };

  /**
   * Interact with a smart contract
   */
  const contractInteraction = async (contractAddress, abi, methodName, args = [], value = 0) => {
    return executeTransaction({
      transactionFn: async (signer) => {
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract[methodName](...args, {
          value: value > 0 ? ethers.utils.parseEther(value.toString()) : 0
        });
        return tx;
      },
      type: 'contract',
      pendingMessage: `Executing ${methodName}...`,
      successMessage: `${methodName} executed successfully!`
    });
  };

  /**
   * Mint NFT example (assuming a standard ERC721 mint function)
   */
  const mintNFT = async (contractAddress, abi, mintPrice = 0) => {
    return executeTransaction({
      transactionFn: async (signer) => {
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const tx = await contract.mint({
          value: mintPrice > 0 ? ethers.utils.parseEther(mintPrice.toString()) : 0
        });
        return tx;
      },
      type: 'mint',
      pendingMessage: 'Minting NFT...',
      successMessage: 'NFT Minted Successfully!',
      onSuccess: (receipt) => {
        // You can add custom logic here, like updating local state
        console.log('NFT minted with transaction hash:', receipt.transactionHash);
      }
    });
  };

  /**
   * Approve token spending
   */
  const approveToken = async (tokenAddress, spenderAddress, amount, abi) => {
    return executeTransaction({
      transactionFn: async (signer) => {
        const contract = new ethers.Contract(tokenAddress, abi, signer);
        const tx = await contract.approve(spenderAddress, ethers.utils.parseEther(amount.toString()));
        return tx;
      },
      type: 'approve',
      pendingMessage: 'Approving token spending...',
      successMessage: 'Token approval successful!'
    });
  };

  /**
   * Reset transaction state
   */
  const resetTransactionState = () => {
    dispatch(resetTransaction());
  };

  /**
   * Get transaction status helpers
   */
  const getTransactionStatus = () => ({
    isPending: transaction.isPending,
    isSuccess: transaction.isSuccess,
    isError: transaction.isError,
    message: transaction.message,
    txHash: transaction.txHash,
    error: transaction.error
  });

  return {
    executeTransaction,
    sendNativeToken,
    contractInteraction,
    mintNFT,
    approveToken,
    resetTransactionState,
    getTransactionStatus,
    isTransactionPending: transaction.isPending,
    transactionMessage: transaction.message,
    transactionError: transaction.error,
    transactionHash: transaction.txHash
  };
};

export default useBlockchainTransaction;
