import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SimpleWalletConnector = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined' && window.ethereum) {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      toast((t) => (
        <span>
          MetaMask is not installed.<br />
          <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-warning mt-2">Install MetaMask</a>
        </span>
      ), { icon: '🦊', duration: 8000 });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        toast.success(`Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    toast.success('Wallet disconnected');
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <button 
        onClick={connectWallet}
        disabled={isConnecting}
        className={`btn ${isConnecting ? 'btn-secondary' : 'btn-primary'}`}
      >
        {isConnecting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Connecting...
          </>
        ) : (
          <>
            <i className="fa fa-wallet me-2"></i>
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="badge bg-success">
        <i className="fa fa-check-circle me-1"></i>
        Connected
      </span>
      <span className="text-muted">
        {formatAddress(address)}
      </span>
      <button 
        onClick={disconnectWallet}
        className="btn btn-sm btn-outline-danger"
      >
        <i className="fa fa-sign-out-alt"></i>
      </button>
    </div>
  );
};

export default SimpleWalletConnector;
