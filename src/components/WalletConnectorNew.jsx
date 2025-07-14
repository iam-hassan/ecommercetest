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
      <div className="wallet-connector-modern">
        <div className="wallet-connect-card">
          <div className="wallet-connect-icon">
            <i className="fa fa-wallet"></i>
          </div>
          <h5 className="wallet-connect-title">Connect Your Wallet</h5>
          <p className="wallet-connect-subtitle">Connect with one of our available wallet providers</p>
          <button 
            onClick={handleConnect}
            disabled={wallet.isConnecting}
            className={`btn wallet-connect-btn ${wallet.isConnecting ? 'connecting' : ''}`}
          >
            {wallet.isConnecting ? (
              <>
                <div className="spinner-modern me-2"></div>
                Connecting...
              </>
            ) : (
              <>
                <i className="fa fa-wallet me-2"></i>
                Connect MetaMask
              </>
            )}
          </button>
          <div className="wallet-features">
            <div className="feature-item">
              <i className="fa fa-shield-alt text-success"></i>
              <span>Secure</span>
            </div>
            <div className="feature-item">
              <i className="fa fa-bolt text-warning"></i>
              <span>Fast</span>
            </div>
            <div className="feature-item">
              <i className="fa fa-globe text-info"></i>
              <span>Multi-chain</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connector-modern">
      <div className="wallet-connected-card">
        {/* Main Wallet Info */}
        <div className="wallet-header">
          <div className="wallet-status-badge">
            <div className="status-dot-animated"></div>
            <span>Connected</span>
          </div>
          <div className="wallet-network">
            <span className={`network-badge ${getNetworkBadgeClass(wallet.networkId)}`}>
              <i className="fa fa-circle me-1"></i>
              {wallet.networkName}
            </span>
          </div>
        </div>

        {/* Wallet Details Grid */}
        <div className="wallet-details-grid">
          <div className="wallet-address-card" onClick={copyAddress}>
            <div className="card-icon">
              <i className="fa fa-user"></i>
            </div>
            <div className="card-content">
              <h6>Wallet Address</h6>
              <p className="address-text">{formatAddress(wallet.address)}</p>
              <span className="copy-hint">
                <i className="fa fa-copy me-1"></i>
                Click to copy
              </span>
            </div>
          </div>

          <div className="wallet-balance-card">
            <div className="card-icon">
              <i className="fa fa-coins"></i>
            </div>
            <div className="card-content">
              <h6>Balance</h6>
              <p className="balance-amount">
                {formatBalance(wallet.balance)} 
                <span className="currency">{networkInfo?.nativeCurrency.symbol || 'ETH'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="wallet-actions">
          <div className="dropdown">
            <button 
              className="btn wallet-action-btn dropdown-toggle" 
              type="button" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
            >
              <i className="fa fa-cog me-2"></i>
              Wallet Settings
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu-modern show">
                <div className="dropdown-section">
                  <h6 className="dropdown-header">
                    <i className="fa fa-exchange-alt me-2"></i>
                    Switch Network
                  </h6>
                  <button 
                    className={`dropdown-item-modern ${wallet.networkId === 1 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork(1)}
                  >
                    <div className="network-option">
                      <i className="fa fa-circle text-primary me-2"></i>
                      <span>Ethereum Mainnet</span>
                      {wallet.networkId === 1 && <i className="fa fa-check ms-auto text-success"></i>}
                    </div>
                  </button>
                  <button 
                    className={`dropdown-item-modern ${wallet.networkId === 137 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork(137)}
                  >
                    <div className="network-option">
                      <i className="fa fa-circle text-info me-2"></i>
                      <span>Polygon Mainnet</span>
                      {wallet.networkId === 137 && <i className="fa fa-check ms-auto text-success"></i>}
                    </div>
                  </button>
                </div>
                
                <div className="dropdown-section">
                  <h6 className="dropdown-header">Testnets</h6>
                  <button 
                    className={`dropdown-item-modern ${wallet.networkId === 5 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork(5)}
                  >
                    <div className="network-option">
                      <i className="fa fa-circle text-warning me-2"></i>
                      <span>Goerli Testnet</span>
                      {wallet.networkId === 5 && <i className="fa fa-check ms-auto text-success"></i>}
                    </div>
                  </button>
                  <button 
                    className={`dropdown-item-modern ${wallet.networkId === 80001 ? 'active' : ''}`}
                    onClick={() => handleSwitchNetwork(80001)}
                  >
                    <div className="network-option">
                      <i className="fa fa-circle text-success me-2"></i>
                      <span>Polygon Mumbai</span>
                      {wallet.networkId === 80001 && <i className="fa fa-check ms-auto text-success"></i>}
                    </div>
                  </button>
                </div>
                
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item-modern disconnect-btn"
                  onClick={handleDisconnect}
                >
                  <div className="network-option">
                    <i className="fa fa-sign-out-alt me-2"></i>
                    <span>Disconnect Wallet</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unsupported Network Warning */}
        {!wallet.isSupported && (
          <div className="unsupported-network-warning">
            <div className="warning-content">
              <i className="fa fa-exclamation-triangle"></i>
              <div>
                <strong>Unsupported Network</strong>
                <p>Switch to Ethereum or Polygon for full functionality.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Status Overlay */}
      {transaction.isPending && (
        <div className="transaction-overlay">
          <div className="transaction-card pending">
            <div className="transaction-icon">
              <div className="spinner-modern"></div>
            </div>
            <h6>Transaction in Progress</h6>
            <p>{transaction.message}</p>
            <small>Please confirm in your wallet and wait for confirmation...</small>
          </div>
        </div>
      )}

      {/* Success notification */}
      {transaction.isSuccess && transaction.txHash && (
        <div className="transaction-overlay">
          <div className="transaction-card success">
            <div className="transaction-icon">
              <i className="fa fa-check-circle"></i>
            </div>
            <h6>Transaction Successful!</h6>
            <p>{transaction.message}</p>
            <a 
              href={`${networkInfo?.blockExplorer}tx/${transaction.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              <i className="fa fa-external-link-alt me-1"></i>
              View on {networkInfo?.name.includes('Polygon') ? 'PolygonScan' : 'Etherscan'}
            </a>
            <button 
              className="btn btn-sm btn-outline-secondary mt-2" 
              onClick={() => dispatch({ type: 'TRANSACTION_RESET' })}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="dropdown-backdrop" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}

      <style>{`
        .wallet-connector-modern {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .wallet-connect-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          color: white;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          max-width: 400px;
          margin: 0 auto;
        }

        .wallet-connect-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          backdrop-filter: blur(10px);
        }

        .wallet-connect-icon i {
          font-size: 2rem;
          color: white;
        }

        .wallet-connect-title {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .wallet-connect-subtitle {
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .wallet-connect-btn {
          background: white;
          color: #667eea;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .wallet-connect-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .wallet-connect-btn.connecting {
          background: rgba(255, 255, 255, 0.8);
          cursor: not-allowed;
        }

        .wallet-features {
          display: flex;
          justify-content: space-around;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .feature-item i {
          font-size: 1.5rem;
        }

        .feature-item span {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        .wallet-connected-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .wallet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .wallet-status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #51cf66, #40c057);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-dot-animated {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .network-badge {
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
          background: linear-gradient(135deg, #339af0, #228be6);
          display: flex;
          align-items: center;
        }

        .network-badge.network-badge-ethereum {
          background: linear-gradient(135deg, #627eea, #5a67d8);
        }

        .network-badge.network-badge-polygon {
          background: linear-gradient(135deg, #8247e5, #7c3aed);
        }

        .network-badge.network-badge-testnet {
          background: linear-gradient(135deg, #fd7e14, #f76707);
        }

        .wallet-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .wallet-address-card, .wallet-balance-card {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-radius: 15px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .wallet-address-card:hover, .wallet-balance-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .card-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .card-icon i {
          color: white;
          font-size: 1.25rem;
        }

        .card-content h6 {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .address-text {
          font-family: monospace;
          font-size: 1rem;
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.5rem;
        }

        .balance-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #495057;
          margin-bottom: 0;
        }

        .currency {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .copy-hint {
          color: #667eea;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .wallet-actions {
          text-align: center;
        }

        .wallet-action-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 25px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .wallet-action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          color: white;
        }

        .dropdown-menu-modern {
          background: white;
          border-radius: 15px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 1rem;
          margin-top: 0.5rem;
          min-width: 280px;
          position: absolute;
          z-index: 1050;
        }

        .dropdown-section {
          margin-bottom: 1rem;
        }

        .dropdown-section:last-child {
          margin-bottom: 0;
        }

        .dropdown-header {
          color: #6c757d;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dropdown-item-modern {
          background: none;
          border: none;
          width: 100%;
          padding: 0.75rem;
          border-radius: 10px;
          transition: all 0.2s ease;
          margin-bottom: 0.25rem;
        }

        .dropdown-item-modern:hover {
          background: #f8f9fa;
        }

        .dropdown-item-modern.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .network-option {
          display: flex;
          align-items: center;
          text-align: left;
        }

        .disconnect-btn:hover {
          background: #dc3545 !important;
          color: white !important;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
        }

        .dropdown-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1040;
        }

        .unsupported-network-warning {
          background: linear-gradient(135deg, #fd7e14, #f76707);
          border-radius: 15px;
          padding: 1rem;
          color: white;
          margin-top: 1rem;
        }

        .warning-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .warning-content i {
          font-size: 1.5rem;
        }

        .warning-content p {
          margin: 0.25rem 0 0 0;
          opacity: 0.9;
        }

        .transaction-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(5px);
        }

        .transaction-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          max-width: 400px;
          margin: 0 1rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
        }

        .transaction-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .transaction-card.pending .transaction-icon {
          background: linear-gradient(135deg, #339af0, #228be6);
        }

        .transaction-card.success .transaction-icon {
          background: linear-gradient(135deg, #51cf66, #40c057);
        }

        .transaction-card.pending .transaction-icon i,
        .transaction-card.success .transaction-icon i {
          font-size: 2rem;
          color: white;
        }

        .spinner-modern {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .explorer-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .explorer-link:hover {
          color: #5a67d8;
        }

        @media (max-width: 768px) {
          .wallet-details-grid {
            grid-template-columns: 1fr;
          }
          
          .wallet-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .wallet-connected-card {
            margin: 0 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WalletConnector;
