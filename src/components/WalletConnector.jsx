import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnectWallet, switchNetwork, getNetworkInfo } from '../redux/action/walletActions';
import toast from 'react-hot-toast';

const WalletConnector = () => {
  const dispatch = useDispatch();
  const wallet = useSelector(state => state.wallet);
  const transaction = useSelector(state => state.transaction);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Show toast notifications for wallet events
  useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      toast.success(`Wallet connected: ${formatAddress(wallet.address)}`, {
        duration: 3000,
        icon: '🔗',
      });
    }
  }, [wallet.isConnected, wallet.address]);

  useEffect(() => {
    if (wallet.error) {
      // Handle wallet error safely
      let errorMessage = 'Wallet connection error';
      if (typeof wallet.error === 'string') {
        errorMessage = wallet.error;
      } else if (wallet.error && typeof wallet.error === 'object') {
        errorMessage = wallet.error.message || wallet.error.error || 'Wallet connection error';
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '❌',
      });
    }
  }, [wallet.error]);

  useEffect(() => {
    if (transaction.isSuccess) {
      toast.success(transaction.message || 'Transaction successful!', {
        duration: 4000,
        icon: '✅',
      });
    }
  }, [transaction.isSuccess, transaction.message]);

  useEffect(() => {
    if (transaction.isError) {
      // Handle transaction error safely
      let errorMessage = 'Transaction failed!';
      if (typeof transaction.error === 'string') {
        errorMessage = transaction.error;
      } else if (transaction.error && typeof transaction.error === 'object') {
        errorMessage = transaction.error.message || transaction.error.error || 'Transaction failed!';
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        icon: '💥',
      });
    }
  }, [transaction.isError, transaction.error]);

  const handleConnect = async () => {
    try {
      await dispatch(connectWallet());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    dispatch(disconnectWallet());
    toast.success('Wallet disconnected', {
      duration: 2000,
      icon: '🔓',
    });
    setIsDropdownOpen(false);
  };

  const handleSwitchNetwork = async (networkId) => {
    try {
      await dispatch(switchNetwork(networkId));
      toast.success(`Switched to ${getNetworkInfo(networkId).name}`, {
        duration: 3000,
        icon: '🔄',
      });
    } catch (error) {
      toast.error('Failed to switch network', {
        duration: 3000,
        icon: '❌',
      });
    }
    setIsDropdownOpen(false);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(wallet.address);
    toast.success('Address copied to clipboard!', {
      duration: 2000,
      icon: '📋',
    });
  };

  const getNetworkBadgeClass = (networkId) => {
    switch (networkId) {
      case 1: return 'network-badge-ethereum';
      case 137: return 'network-badge-polygon';
      case 5: case 80001: return 'network-badge-testnet';
      default: return '';
    }
  };

  const networkInfo = wallet.networkId ? getNetworkInfo(wallet.networkId) : null;

  if (!wallet.isConnected) {
    return (
      <div className="wallet-connector">
        <button 
          onClick={handleConnect}
          disabled={wallet.isConnecting}
          className={`btn wallet-button ${wallet.isConnecting ? 'btn-secondary' : 'btn-primary'}`}
          style={{ minWidth: '140px' }}
        >
          {wallet.isConnecting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Connecting...
            </>
          ) : (
            <>
              <i className="fa fa-wallet me-2"></i>
              Connect Wallet
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connector">
      <div className="wallet-connected-section">
        {/* Mobile-friendly wallet display */}
        <div className="d-flex align-items-center flex-wrap gap-2 wallet-responsive">
          
          {/* Connection Status Indicator */}
          <div className="wallet-status">
            <span className="badge bg-success d-flex align-items-center">
              <span className="status-dot me-1"></span>
              <i className="fa fa-check-circle me-1"></i>
              Connected
            </span>
          </div>

          {/* Network Badge */}
          <div className="network-info">
            <span className={`badge bg-primary ${getNetworkBadgeClass(wallet.networkId)} d-flex align-items-center`}>
              <i className="fa fa-globe me-1"></i>
              {wallet.networkName}
              {!wallet.isSupported && (
                <i className="fa fa-exclamation-triangle ms-1 text-warning" title="Unsupported network"></i>
              )}
            </span>
          </div>

          {/* Address Display with Click to Copy */}
          <div className="wallet-details">
            <button 
              className="btn btn-sm btn-outline-secondary address-display d-flex align-items-center"
              onClick={copyAddress}
              title="Click to copy address"
            >
              <i className="fa fa-user me-1"></i>
              {formatAddress(wallet.address)}
              <i className="fa fa-copy ms-1"></i>
            </button>
          </div>

          {/* Balance Display */}
          <div className="balance-display">
            <span className="badge bg-light text-dark d-flex align-items-center">
              <i className="fa fa-coins me-1"></i>
              <span className="fw-bold">
                {formatBalance(wallet.balance)} {networkInfo?.nativeCurrency.symbol || 'ETH'}
              </span>
            </span>
          </div>

          {/* Actions Dropdown */}
          <div className="dropdown">
            <button 
              className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center" 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
            >
              <i className="fa fa-cog me-1"></i>
              Actions
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu show position-absolute" style={{ zIndex: 1050 }}>
                <h6 className="dropdown-header">
                  <i className="fa fa-exchange-alt me-1"></i>
                  Switch Network
                </h6>
                <button 
                  className={`dropdown-item ${wallet.networkId === 1 ? 'active' : ''}`}
                  onClick={() => handleSwitchNetwork(1)}
                >
                  <i className="fa fa-circle text-primary me-2"></i>
                  Ethereum Mainnet
                </button>
                <button 
                  className={`dropdown-item ${wallet.networkId === 137 ? 'active' : ''}`}
                  onClick={() => handleSwitchNetwork(137)}
                >
                  <i className="fa fa-circle text-info me-2"></i>
                  Polygon Mainnet
                </button>
                <div className="dropdown-divider"></div>
                <h6 className="dropdown-header">Testnets</h6>
                <button 
                  className={`dropdown-item ${wallet.networkId === 5 ? 'active' : ''}`}
                  onClick={() => handleSwitchNetwork(5)}
                >
                  <i className="fa fa-circle text-warning me-2"></i>
                  Goerli Testnet
                </button>
                <button 
                  className={`dropdown-item ${wallet.networkId === 80001 ? 'active' : ''}`}
                  onClick={() => handleSwitchNetwork(80001)}
                >
                  <i className="fa fa-circle text-success me-2"></i>
                  Polygon Mumbai
                </button>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item text-danger"
                  onClick={handleDisconnect}
                >
                  <i className="fa fa-sign-out-alt me-2"></i>
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unsupported Network Warning */}
        {!wallet.isSupported && (
          <div className="alert alert-warning alert-blockchain mt-2 mb-0" role="alert">
            <div className="d-flex align-items-center">
              <i className="fa fa-exclamation-triangle me-2"></i>
              <div>
                <strong>Unsupported Network</strong>
                <br />
                <small>Switch to Ethereum or Polygon for full functionality.</small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Status Overlay */}
      {transaction.isPending && (
        <div className="transaction-status mt-2">
          <div className="alert alert-info alert-blockchain transaction-loading" role="alert">
            <div className="d-flex align-items-center">
              <div className="spinner-border spinner-border-sm me-2 status-icon-pending" role="status"></div>
              <div className="flex-grow-1">
                <strong>Transaction in Progress</strong>
                <br />
                <small>{transaction.message}</small>
                <br />
                <small className="text-muted">
                  <i className="fa fa-info-circle me-1"></i>
                  Please confirm in your wallet and wait for confirmation...
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error notifications inline */}
      {transaction.isSuccess && transaction.txHash && (
        <div className="transaction-status mt-2">
          <div className="alert alert-success alert-blockchain" role="alert">
            <div className="d-flex align-items-center">
              <i className="fa fa-check-circle me-2 status-icon-success"></i>
              <div className="flex-grow-1">
                <strong>Transaction Successful!</strong>
                <br />
                <small>{transaction.message}</small>
                <br />
                <a 
                  href={`${networkInfo?.blockExplorer}tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small text-decoration-none fw-bold"
                >
                  <i className="fa fa-external-link-alt me-1"></i>
                  View on {networkInfo?.name.includes('Polygon') ? 'PolygonScan' : 'Etherscan'}
                </a>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => dispatch({ type: 'TRANSACTION_RESET' })}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="position-fixed w-100 h-100 top-0 start-0" 
          style={{ zIndex: 1040 }}
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default WalletConnector;
