import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { autoConnectWallet } from '../redux/action/walletActions';

/**
 * WalletProvider component that handles automatic wallet connection
 * and sets up global wallet state management
 */
const WalletProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Auto-connect to wallet if user was previously connected
    dispatch(autoConnectWallet());

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      if (window.ethereum && window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [dispatch]);

  return <>{children}</>;
};

export default WalletProvider;
