import React from "react";
import { useSelector } from "react-redux";
import WalletConnector from "../components/WalletConnectorNew";
import { Footer, Navbar } from "../components";

const Wallet = () => {
  const wallet = useSelector((state) => state.wallet);
  const transaction = useSelector((state) => state.transaction);

  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <div className="wallet-hero">
        <div className="container">
          <div className="row align-items-center py-5">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title">
                  Your Digital <span className="gradient-text">Wallet</span>
                </h1>
                <p className="hero-subtitle">
                  Connect, manage, and secure your cryptocurrency assets with ease. 
                  Experience the future of decentralized finance.
                </p>
                {!wallet.isConnected && (
                  <div className="hero-features">
                    <div className="feature-item">
                      <i className="fa fa-shield-alt"></i>
                      <span>Secure & Private</span>
                    </div>
                    <div className="feature-item">
                      <i className="fa fa-bolt"></i>
                      <span>Lightning Fast</span>
                    </div>
                    <div className="feature-item">
                      <i className="fa fa-globe"></i>
                      <span>Multi-Chain Support</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-6">
              <div className="wallet-illustration">
                <div className="floating-card card-1">
                  <i className="fa fa-ethereum"></i>
                </div>
                <div className="floating-card card-2">
                  <i className="fa fa-bitcoin"></i>
                </div>
                <div className="floating-card card-3">
                  <i className="fa fa-coins"></i>
                </div>
                <div className="central-wallet">
                  <i className="fa fa-wallet"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Wallet Connection Section */}
      <div className="wallet-section">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <WalletConnector />
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Details Section */}
      {wallet.isConnected && (
        <div className="wallet-details-section">
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="details-grid">
                  {/* Account Overview */}
                  <div className="detail-card account-overview">
                    <div className="card-header">
                      <h5>
                        <i className="fa fa-user-circle me-2"></i>
                        Account Overview
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="info-item">
                        <label>Wallet Address</label>
                        <div className="address-display">
                          <span className="address">{wallet.address}</span>
                          <button 
                            className="copy-btn"
                            onClick={() => navigator.clipboard.writeText(wallet.address)}
                          >
                            <i className="fa fa-copy"></i>
                          </button>
                        </div>
                      </div>
                      <div className="info-item">
                        <label>Balance</label>
                        <div className="balance-display">
                          <span className="amount">{wallet.balance}</span>
                          <span className="currency">
                            {wallet.networkName && wallet.networkName.includes('Polygon') ? 'MATIC' : 'ETH'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network Information */}
                  <div className="detail-card network-info">
                    <div className="card-header">
                      <h5>
                        <i className="fa fa-network-wired me-2"></i>
                        Network Information
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="info-item">
                        <label>Network Name</label>
                        <div className="network-display">
                          <span className="network-name">{wallet.networkName}</span>
                          <span className={`status-badge ${wallet.isSupported ? 'supported' : 'unsupported'}`}>
                            {wallet.isSupported ? 'Supported' : 'Unsupported'}
                          </span>
                        </div>
                      </div>
                      <div className="info-item">
                        <label>Network ID</label>
                        <span className="network-id">{wallet.networkId}</span>
                      </div>
                      <div className="info-item">
                        <label>Connection Status</label>
                        <div className="connection-status">
                          <div className="status-indicator connected"></div>
                          <span>Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="detail-card transaction-history">
                    <div className="card-header">
                      <h5>
                        <i className="fa fa-history me-2"></i>
                        Recent Activity
                      </h5>
                    </div>
                    <div className="card-body">
                      {transaction.txHash ? (
                        <div className="transaction-item">
                          <div className="transaction-icon">
                            <i className="fa fa-arrow-up"></i>
                          </div>
                          <div className="transaction-details">
                            <div className="transaction-type">Payment Transaction</div>
                            <div className="transaction-hash">
                              {transaction.txHash.slice(0, 10)}...{transaction.txHash.slice(-8)}
                            </div>
                          </div>
                          <div className="transaction-status success">
                            <i className="fa fa-check-circle"></i>
                            Success
                          </div>
                        </div>
                      ) : (
                        <div className="no-transactions">
                          <i className="fa fa-inbox"></i>
                          <p>No recent transactions</p>
                          <small>Your transaction history will appear here</small>
                        </div>
                      )}
                    </div>
                  </div>

                  
                </div>

                {/* Error Display */}
                {wallet.error && (
                  <div className="error-section mt-4">
                    <div className="error-card">
                      <div className="error-icon">
                        <i className="fa fa-exclamation-triangle"></i>
                      </div>
                      <div className="error-content">
                        <h6>Connection Error</h6>
                        <p>
                          {(() => {
                            if (typeof wallet.error === 'string') {
                              return wallet.error;
                            } else if (wallet.error && typeof wallet.error === 'object') {
                              return wallet.error.message || wallet.error.error || 'An error occurred';
                            }
                            return 'An unknown error occurred';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        .wallet-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .wallet-hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(45deg, #ffd700, #ffed4a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-features {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .hero-features .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.75rem 1rem;
          border-radius: 25px;
          backdrop-filter: blur(10px);
        }

        .hero-features .feature-item i {
          font-size: 1.25rem;
        }

        .wallet-illustration {
          position: relative;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .floating-card {
          position: absolute;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: float 3s ease-in-out infinite;
        }

        .floating-card i {
          font-size: 2rem;
          color: white;
        }

        .card-1 {
          top: 20%;
          left: 20%;
          animation-delay: 0s;
        }

        .card-2 {
          top: 60%;
          right: 20%;
          animation-delay: 1s;
        }

        .card-3 {
          top: 10%;
          right: 30%;
          animation-delay: 2s;
        }

        .central-wallet {
          width: 120px;
          height: 120px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          z-index: 2;
        }

        .central-wallet i {
          font-size: 3rem;
          color: white;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .wallet-section {
          background: #f8f9fa;
        }

        .wallet-details-section {
          background: white;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .detail-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .detail-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .detail-card .card-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 1.5rem;
          border: none;
        }

        .detail-card .card-header h5 {
          margin: 0;
          font-weight: 600;
          display: flex;
          align-items: center;
        }

        .detail-card .card-body {
          padding: 2rem;
        }

        .info-item {
          margin-bottom: 1.5rem;
        }

        .info-item:last-child {
          margin-bottom: 0;
        }

        .info-item label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6c757d;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .address-display {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .address-display .address {
          font-family: monospace;
          font-size: 0.875rem;
          color: #495057;
          flex: 1;
          word-break: break-all;
        }

        .copy-btn {
          background: #667eea;
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .copy-btn:hover {
          background: #5a67d8;
          transform: scale(1.1);
        }

        .balance-display {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .balance-display .amount {
          font-size: 2rem;
          font-weight: 700;
          color: #495057;
        }

        .balance-display .currency {
          font-size: 1.25rem;
          color: #6c757d;
          font-weight: 500;
        }

        .network-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .network-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #495057;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-badge.supported {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.unsupported {
          background: #f8d7da;
          color: #721c24;
        }

        .network-id {
          font-size: 1.125rem;
          font-weight: 600;
          color: #495057;
        }

        .connection-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          position: relative;
        }

        .status-indicator.connected {
          background: #28a745;
          animation: pulse-green 2s infinite;
        }

        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 10px;
          border: 1px solid #e9ecef;
        }

        .transaction-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #28a745, #20c997);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .transaction-details {
          flex: 1;
        }

        .transaction-type {
          font-weight: 600;
          color: #495057;
          margin-bottom: 0.25rem;
        }

        .transaction-hash {
          font-family: monospace;
          font-size: 0.875rem;
          color: #6c757d;
        }

        .transaction-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .transaction-status.success {
          color: #28a745;
        }

        .no-transactions {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }

        .no-transactions i {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-transactions p {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .action-btn {
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 15px;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .action-btn:hover {
          border-color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.1);
        }

        .action-btn i {
          font-size: 1.5rem;
          color: #667eea;
        }

        .action-btn span {
          font-weight: 600;
          color: #495057;
        }

        .action-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #e7f3ff;
          padding: 1rem;
          border-radius: 10px;
          color: #0066cc;
          font-size: 0.875rem;
        }

        .error-section {
          max-width: 600px;
          margin: 0 auto;
        }

        .error-card {
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .error-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .error-icon i {
          font-size: 1.5rem;
        }

        .error-content h6 {
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .error-content p {
          margin: 0;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-features {
            gap: 1rem;
          }

          .hero-features .feature-item {
            flex: 1;
            min-width: 150px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            grid-template-columns: repeat(2, 1fr);
          }

          .wallet-illustration {
            height: 300px;
          }

          .floating-card {
            width: 60px;
            height: 60px;
          }

          .floating-card i {
            font-size: 1.5rem;
          }

          .central-wallet {
            width: 100px;
            height: 100px;
          }

          .central-wallet i {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default Wallet;
