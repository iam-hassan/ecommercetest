import React, { useState } from "react";
import { Footer, Navbar } from "../components";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import WalletConnector from "../components/WalletConnector";
import { connectWallet, startTransaction, transactionSuccess, transactionFailure, resetTransaction } from "../redux/action/walletActions";
import { ethers } from "ethers";

const Checkout = () => {
  // Transaction Modal Popup (top-level helper component)
  function TransactionModal() {
    return (
      <div className={`modal fade show`} tabIndex="-1" style={{display: showTxModal ? 'block' : 'none', background: 'rgba(0,0,0,0.5)', zIndex: 2000}}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Crypto Payment</h5>
              <button type="button" className="btn-close" onClick={() => setShowTxModal(false)} aria-label="Close"></button>
            </div>
            <div className="modal-body text-center">
              {transaction.isPending && (
                <>
                  <div className="mb-3">
                    <div className="spinner-border text-primary mb-2" role="status"></div>
                  </div>
                  <div className="fw-bold mb-2">{transaction.message || 'Please confirm in your wallet...'}</div>
                  <div className="text-muted small">Check your MetaMask popup and confirm the transaction.</div>
                </>
              )}
              {transaction.isSuccess && (
                <>
                  <div className="mb-3">
                    <i className="fa fa-check-circle fa-3x text-success mb-2"></i>
                  </div>
                  <div className="fw-bold mb-2">Minted! Payment successful.</div>
                  {transaction.txHash && (
                    <div className="mb-2">
                      <a href={`https://etherscan.io/tx/${transaction.txHash}`} target="_blank" rel="noopener noreferrer" className="small">
                        View on Etherscan
                      </a>
                    </div>
                  )}
                  <button className="btn btn-success" onClick={() => setShowTxModal(false)}>Close</button>
                </>
              )}
              {transaction.isError && (
                <>
                  <div className="mb-3">
                    <i className="fa fa-times-circle fa-3x text-danger mb-2"></i>
                  </div>
                  <div className="fw-bold mb-2">Transaction failed!</div>
                  <div className="text-danger small mb-2">
                    {(() => {
                      const err = transaction.error;
                      let errorMsg = '';
                      
                      if (typeof err === 'string') {
                        errorMsg = err.toLowerCase();
                      } else if (err && typeof err === 'object') {
                        errorMsg = (err.message || err.error || '').toLowerCase();
                      }
                      
                      // Map technical errors to user-friendly messages
                      if (errorMsg.includes('insufficient funds')) {
                        return "You don't have enough balance in your wallet.";
                      } else if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
                        return 'You cancelled the transaction.';
                      } else if (errorMsg.includes('network error') || errorMsg.includes('network')) {
                        return 'Network error. Please check your connection and try again.';
                      } else if (errorMsg.includes('gas')) {
                        return 'Transaction fee is too high. Please try again later.';
                      }
                      
                      return 'Transaction failed. Please try again or check your wallet.';
                    })()}
                  </div>
                  <button className="btn btn-danger mt-2" onClick={() => setShowTxModal(false)}>Close</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  const state = useSelector((state) => state.handleCart);
  const wallet = useSelector((state) => state.wallet);
  const transaction = useSelector((state) => state.transaction);
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState('traditional');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showTxModal, setShowTxModal] = useState(false);

  const EmptyCart = () => {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-12 py-5 bg-light text-center">
            <h4 className="p-3 display-5">No item in Cart</h4>
            <Link to="/" className="btn btn-outline-dark mx-4">
              <i className="fa fa-arrow-left"></i> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const handlePaymentSuccess = (paymentInfo) => {
    let subtotal = 0;
    let shipping = 30.0;
    
    state.forEach((item) => {
      subtotal += item.price * item.qty;
    });

    setOrderDetails({
      ...paymentInfo,
      orderNumber: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      items: state,
      total: Math.round(subtotal + shipping)
    });
    setOrderComplete(true);
  };

  const handleTraditionalPayment = () => {
    // Simulate traditional payment processing
    toast.success('Order placed successfully!', {
      duration: 4000,
      icon: '🎉',
    });
    
    handlePaymentSuccess({
      method: 'traditional',
      currency: 'USD',
      amount: 0 // Will be calculated in handlePaymentSuccess
    });
  };

  let subtotal = 0;
  let shipping = 30.0;
  let totalItems = 0;
  
  state.forEach((item) => {
    subtotal += item.price * item.qty;
    totalItems += item.qty;
  });

  if (orderComplete) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-body text-center py-5">
                  <div className="mb-4">
                    <i className="fa fa-check-circle fa-4x text-success"></i>
                  </div>
                  <h2 className="text-success mb-3">Order Confirmed!</h2>
                  <p className="lead">Thank you for your purchase.</p>
                  
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <h6>Order Number:</h6>
                      <p className="fw-bold">{orderDetails.orderNumber}</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Payment Method:</h6>
                      <p className="fw-bold text-capitalize">
                        {orderDetails.method === 'crypto' ? 
                          `${orderDetails.currency} (Blockchain)` : 
                          'Traditional Payment'
                        }
                      </p>
                    </div>
                  </div>

                  {orderDetails.method === 'crypto' && (
                    <div className="alert alert-info mt-3">
                      <h6>Blockchain Payment Details:</h6>
                      <p className="mb-1"><strong>Amount:</strong> {orderDetails.amount} {orderDetails.currency}</p>
                      <p className="mb-1"><strong>Network:</strong> {orderDetails.network}</p>
                      {orderDetails.txHash && (
                        <p className="mb-0">
                          <strong>Transaction Hash:</strong> 
                          <br />
                          <small className="font-monospace">{orderDetails.txHash}</small>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <Link to="/" className="btn btn-primary me-2">
                      Continue Shopping
                    </Link>
                    <Link to="/orders" className="btn btn-outline-secondary">
                      View Orders
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const ShowCheckout = () => {
    return (
      <>
        <div className="container py-5">
          <div className="row my-4">
            <div className="col-md-5 col-lg-4 order-md-last">
              {/* Order Summary */}
              <div className="card mb-4">
                <div className="card-header py-3 bg-light">
                  <h5 className="mb-0">Order Summary</h5>
                </div>
                <div className="card-body">
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 pb-0">
                      Products ({totalItems})<span>${Math.round(subtotal)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                      Shipping
                      <span>${shipping}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center border-0 px-0 mb-3">
                      <div>
                        <strong>Total amount</strong>
                      </div>
                      <span>
                        <strong>${Math.round(subtotal + shipping)}</strong>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Payment Method</h5>
                </div>
                <div className="card-body">
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="traditional"
                      value="traditional"
                      checked={paymentMethod === 'traditional'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="traditional">
                      <i className="fa fa-credit-card me-2"></i>
                      Traditional Payment (Card/PayPal)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="crypto"
                      value="crypto"
                      checked={paymentMethod === 'crypto'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="crypto">
                      <i className="fa fa-wallet me-2"></i>
                      Cryptocurrency (ETH/MATIC)
                    </label>
                    <small className="text-muted d-block mt-1">
                      Connect your wallet to pay with crypto
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-7 col-lg-8">
              {/* Billing Address Form */}
              <div className="card mb-4">
                <div className="card-header py-3">
                  <h4 className="mb-0">Billing address</h4>
                </div>
                <div className="card-body">
                  <form className="needs-validation" noValidate>
                    <div className="row g-3">
                      <div className="col-sm-6 my-1">
                        <label htmlFor="firstName" className="form-label">
                          First name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          placeholder=""
                          required
                        />
                      </div>

                      <div className="col-sm-6 my-1">
                        <label htmlFor="lastName" className="form-label">
                          Last name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          placeholder=""
                          required
                        />
                      </div>

                      <div className="col-12 my-1">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder="you@example.com"
                          required
                        />
                      </div>

                      <div className="col-12 my-1">
                        <label htmlFor="address" className="form-label">
                          Address
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          placeholder="1234 Main St"
                          required
                        />
                      </div>

                      <div className="col-md-5 my-1">
                        <label htmlFor="country" className="form-label">
                          Country
                        </label>
                        <select className="form-select" id="country" required>
                          <option value="">Choose...</option>
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="col-md-4 my-1">
                        <label htmlFor="state" className="form-label">
                          State
                        </label>
                        <select className="form-select" id="state" required>
                          <option value="">Choose...</option>
                          <option>California</option>
                          <option>New York</option>
                          <option>Texas</option>
                          <option>Other</option>
                        </select>
                      </div>

                      <div className="col-md-3 my-1">
                        <label htmlFor="zip" className="form-label">
                          Zip
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="zip"
                          placeholder=""
                          required
                        />
                      </div>
                    </div>

                    <hr className="my-4" />

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="same-address"
                      />
                      <label className="form-check-label" htmlFor="same-address">
                        Shipping address is the same as my billing address
                      </label>
                    </div>

                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="save-info"
                      />
                      <label className="form-check-label" htmlFor="save-info">
                        Save this information for next time
                      </label>
                    </div>
                  </form>
                </div>
              </div>

              {/* Payment Section */}
              {paymentMethod === 'crypto' ? (
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fa fa-wallet me-2"></i>
                      Cryptocurrency Payment
                    </h5>
                  </div>
                  <div className="card-body text-center">
                    {!wallet.isConnected ? (
                      <>
                        <div className="alert alert-warning mb-3">
                          <i className="fa fa-exclamation-triangle me-2"></i>
                          Please connect your wallet to pay with crypto.
                        </div>
                        <div className="mb-3 d-flex justify-content-center">
                          <WalletConnector />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="alert alert-success mb-3">
                          <i className="fa fa-check-circle me-2"></i>
                          Wallet Connected: <span className="font-monospace">{wallet.address && `${wallet.address.slice(0,6)}...${wallet.address.slice(-4)}`}</span>
                        </div>
                        <div className="mb-3">
                          <h6>Order Total: ${Math.round(subtotal + shipping)}</h6>
                          <p className="text-muted">Approximate crypto equivalent will be calculated at payment time</p>
                        </div>
                        <button
                          className="btn btn-success btn-lg w-100"
                          onClick={async () => {
                            setShowTxModal(true);
                            const ethAmount = '0.025';
                            dispatch(startTransaction({
                              message: 'Please confirm in your wallet...',
                              type: 'crypto'
                            }));
                            const minPendingTime = 1000; // 1 second
                            const start = Date.now();
                            let tx;
                            try {
                              if (!window.ethereum) throw new Error('MetaMask not found');
                              const provider = new ethers.providers.Web3Provider(window.ethereum);
                              const signer = provider.getSigner();
                              tx = await signer.sendTransaction({
                                to: "0x000000000000000000000000000000000000dead", // Demo: send to a burn address. Replace with merchant address in production.
                                value: ethers.utils.parseEther(ethAmount)
                              });
                              dispatch(startTransaction({
                                message: 'Waiting for transaction confirmation...',
                                type: 'crypto'
                              }));
                              await tx.wait();
                              const elapsed = Date.now() - start;
                              if (elapsed < minPendingTime) {
                                await new Promise(res => setTimeout(res, minPendingTime - elapsed));
                              }
                              dispatch(transactionSuccess({
                                txHash: tx.hash,
                                message: 'Minted! Payment successful.'
                              }));
                              toast.success('Crypto payment successful!', { icon: '🪙' });
                              handlePaymentSuccess({
                                method: 'crypto',
                                currency: 'ETH',
                                amount: ethAmount,
                                network: wallet.networkName,
                                txHash: tx.hash
                              });
                            } catch (err) {
                              // Detailed error logging
                              console.error('MetaMask transaction error:', err);
                              if (err && err.data) {
                                console.error('MetaMask error data:', err.data);
                              }
                              if (err && err.stack) {
                                console.error('MetaMask error stack:', err.stack);
                              }
                              const elapsed = Date.now() - start;
                              if (elapsed < minPendingTime) {
                                await new Promise(res => setTimeout(res, minPendingTime - elapsed));
                              }
                              dispatch(transactionFailure({
                                message: 'Transaction failed!',
                                error: err.message || err
                              }));
                              // Show user-friendly error message
                              let userFriendlyMsg = 'Transaction failed. Please try again.';
                              let errorMsg = '';
                              
                              if (typeof err === 'string') {
                                errorMsg = err.toLowerCase();
                              } else if (err && typeof err === 'object') {
                                errorMsg = (err.message || err.error || '').toLowerCase();
                              }
                              
                              // Map technical errors to user-friendly messages
                              if (errorMsg.includes('insufficient funds')) {
                                userFriendlyMsg = "You don't have enough balance";
                              } else if (errorMsg.includes('user rejected') || errorMsg.includes('user denied')) {
                                userFriendlyMsg = 'Transaction was cancelled';
                              } else if (errorMsg.includes('network error') || errorMsg.includes('network')) {
                                userFriendlyMsg = 'Network error. Please try again';
                              } else if (errorMsg.includes('gas')) {
                                userFriendlyMsg = 'Transaction fee too high. Try again later';
                              }
                              
                              toast.error(userFriendlyMsg);
                            }
                          }}
                        >
                          <i className="fa fa-wallet me-2"></i>
                          Pay with Crypto
                        </button>
                        <small className="text-muted d-block mt-2">
                          You will be prompted by MetaMask to confirm the transaction.
                        </small>
                        {/* Transaction Modal Popup */}
                        <TransactionModal />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fa fa-credit-card me-2"></i>
                      Traditional Payment
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="row gy-3">
                      <div className="col-md-6">
                        <label htmlFor="cc-name" className="form-label">
                          Name on card
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cc-name"
                          placeholder=""
                          required
                        />
                        <small className="text-muted">
                          Full name as displayed on card
                        </small>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="cc-number" className="form-label">
                          Credit card number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cc-number"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="cc-expiration" className="form-label">
                          Expiration
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cc-expiration"
                          placeholder="MM/YY"
                          required
                        />
                      </div>

                      <div className="col-md-3">
                        <label htmlFor="cc-cvv" className="form-label">
                          CVV
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cc-cvv"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    <hr className="my-4" />

                    <button 
                      className="w-100 btn btn-primary btn-lg"
                      type="button"
                      onClick={handleTraditionalPayment}
                    >
                      <i className="fa fa-credit-card me-2"></i>
                      Place Order - ${Math.round(subtotal + shipping)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="text-center py-4">Checkout</h1>
        <hr />
        {state.length ? <ShowCheckout /> : <EmptyCart />}
      </div>
      <TransactionModal />
      <Footer />
    </>
  );
};

export default Checkout;
