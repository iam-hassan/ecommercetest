import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import useBlockchainTransaction from '../hooks/useBlockchainTransaction';
import toast from 'react-hot-toast';

const CryptoCheckout = ({ cartTotal, onPaymentSuccess }) => {
  const wallet = useSelector(state => state.wallet);
  const transaction = useSelector(state => state.transaction);
  const [selectedCurrency, setSelectedCurrency] = useState('ETH');
  const [merchantAddress] = useState('0x742f5CE0e2B3C98c8c2c6C8b8e6a8e8e8e8e8e8e'); // Example merchant address

  const { sendNativeToken } = useBlockchainTransaction();

  // Conversion rates (in a real app, these would come from an API)
  const conversionRates = {
    ETH: 2000, // 1 ETH = $2000
    MATIC: 0.8  // 1 MATIC = $0.8
  };

  const calculateCryptoAmount = () => {
    const rate = conversionRates[selectedCurrency];
    return (cartTotal / rate).toFixed(6);
  };

  const handleCryptoPayment = async () => {
    if (!wallet.isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!wallet.isSupported) {
      toast.error('Please switch to a supported network (Ethereum or Polygon)');
      return;
    }

    const cryptoAmount = calculateCryptoAmount();
    const hasEnoughBalance = parseFloat(wallet.balance) >= parseFloat(cryptoAmount);
    
    if (!hasEnoughBalance) {
      toast.error(`Insufficient balance. You need ${cryptoAmount} ${selectedCurrency}`);
      return;
    }

    try {
      const receipt = await sendNativeToken(merchantAddress, cryptoAmount);
      
      // Call success callback to update order status
      if (onPaymentSuccess) {
        onPaymentSuccess({
          method: 'crypto',
          currency: selectedCurrency,
          amount: cryptoAmount,
          txHash: receipt.transactionHash,
          network: wallet.networkName
        });
      }

      toast.success('Payment successful! Order confirmed.', {
        duration: 5000,
        icon: '🎉',
      });

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const getCurrentCurrency = useCallback(() => {
    if (wallet.networkId === 137 || wallet.networkId === 80001) {
      return 'MATIC';
    }
    return 'ETH';
  }, [wallet.networkId]);

  // Auto-select currency based on network
  React.useEffect(() => {
    if (wallet.isConnected) {
      setSelectedCurrency(getCurrentCurrency());
    }
  }, [wallet.networkId, wallet.isConnected, getCurrentCurrency]);

  if (!wallet.isConnected) {
    return (
      <div className="crypto-checkout">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fa fa-wallet me-2"></i>
              Pay with Cryptocurrency
            </h5>
          </div>
          <div className="card-body text-center">
            <i className="fa fa-wallet fa-3x text-muted mb-3"></i>
            <p className="text-muted">Connect your wallet to pay with cryptocurrency</p>
            <small className="text-muted">Accepted: ETH, MATIC</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-checkout">
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="fa fa-wallet me-2"></i>
            Pay with Cryptocurrency
          </h5>
        </div>
        <div className="card-body">
          {/* Payment Summary */}
          <div className="payment-summary mb-3">
            <div className="row">
              <div className="col-sm-6">
                <strong>Order Total:</strong>
              </div>
              <div className="col-sm-6 text-end">
                <strong>${cartTotal.toFixed(2)} USD</strong>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <strong>Pay in {selectedCurrency}:</strong>
              </div>
              <div className="col-sm-6 text-end">
                <strong className="text-primary">
                  {calculateCryptoAmount()} {selectedCurrency}
                </strong>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-sm-6">
                <small className="text-muted">Conversion Rate:</small>
              </div>
              <div className="col-sm-6 text-end">
                <small className="text-muted">
                  1 {selectedCurrency} = ${conversionRates[selectedCurrency]}
                </small>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="wallet-info mb-3 p-3 bg-light rounded">
            <div className="row">
              <div className="col-sm-6">
                <small><strong>Connected Wallet:</strong></small>
                <br />
                <small className="text-muted font-monospace">
                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                </small>
              </div>
              <div className="col-sm-6 text-end">
                <small><strong>Balance:</strong></small>
                <br />
                <small className={`${parseFloat(wallet.balance) >= parseFloat(calculateCryptoAmount()) ? 'text-success' : 'text-danger'}`}>
                  {parseFloat(wallet.balance).toFixed(4)} {getCurrentCurrency()}
                </small>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-12">
                <small><strong>Network:</strong></small>
                <br />
                <small className="text-muted">
                  {wallet.networkName}
                  {wallet.isSupported ? (
                    <i className="fa fa-check-circle text-success ms-1"></i>
                  ) : (
                    <i className="fa fa-exclamation-triangle text-warning ms-1"></i>
                  )}
                </small>
              </div>
            </div>
          </div>

          {/* Payment Warnings */}
          {!wallet.isSupported && (
            <div className="alert alert-warning">
              <i className="fa fa-exclamation-triangle me-2"></i>
              Please switch to Ethereum or Polygon network to complete payment.
            </div>
          )}

          {parseFloat(wallet.balance) < parseFloat(calculateCryptoAmount()) && wallet.isSupported && (
            <div className="alert alert-danger">
              <i className="fa fa-exclamation-circle me-2"></i>
              Insufficient balance. You need {calculateCryptoAmount()} {selectedCurrency} to complete this payment.
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handleCryptoPayment}
            disabled={
              transaction.isPending || 
              !wallet.isSupported || 
              parseFloat(wallet.balance) < parseFloat(calculateCryptoAmount())
            }
            className={`btn w-100 ${
              transaction.isPending ? 'btn-secondary' : 'btn-success'
            }`}
          >
            {transaction.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing Payment...
              </>
            ) : (
              <>
                <i className="fa fa-credit-card me-2"></i>
                Pay {calculateCryptoAmount()} {selectedCurrency}
              </>
            )}
          </button>

          {/* Transaction Status */}
          {transaction.isPending && (
            <div className="alert alert-info mt-3">
              <div className="d-flex align-items-center">
                <div className="spinner-border spinner-border-sm me-2"></div>
                <div>
                  <strong>Payment Processing</strong>
                  <br />
                  <small>Please confirm the transaction in your wallet...</small>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3">
            <small className="text-muted">
              <i className="fa fa-shield-alt me-1"></i>
              Secure blockchain payment • Transaction fees apply
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCheckout;
