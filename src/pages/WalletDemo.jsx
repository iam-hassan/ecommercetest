import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import useBlockchainTransaction from '../hooks/useBlockchainTransaction';

const WalletDemo = () => {
  const wallet = useSelector(state => state.wallet);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [mintPrice, setMintPrice] = useState('0');

  const {
    sendNativeToken,
    mintNFT,
    contractInteraction,
    resetTransactionState,
    isTransactionPending,
    transactionMessage,
    transactionError,
    transactionHash
  } = useBlockchainTransaction();

  const handleSendToken = async (e) => {
    e.preventDefault();
    if (!sendAddress || !sendAmount) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await sendNativeToken(sendAddress, sendAmount);
      setSendAddress('');
      setSendAmount('');
    } catch (error) {
      console.error('Send failed:', error);
    }
  };

  const handleMintNFT = async (e) => {
    e.preventDefault();
    if (!contractAddress) {
      alert('Please enter a contract address');
      return;
    }

    // Example ERC721 ABI for mint function
    const erc721Abi = [
      'function mint() public payable',
      'function mintTo(address to) public payable'
    ];

    try {
      await mintNFT(contractAddress, erc721Abi, mintPrice);
      setContractAddress('');
      setMintPrice('0');
    } catch (error) {
      console.error('Mint failed:', error);
    }
  };

  const handleContractRead = async () => {
    if (!contractAddress) {
      alert('Please enter a contract address');
      return;
    }

    // Example: Read total supply from an ERC721 contract
    const erc721Abi = [
      'function totalSupply() public view returns (uint256)',
      'function name() public view returns (string)',
      'function symbol() public view returns (string)'
    ];

    try {
      await contractInteraction(contractAddress, erc721Abi, 'totalSupply');
    } catch (error) {
      console.error('Contract read failed:', error);
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-body text-center">
                <h2>Wallet Demo</h2>
                <p className="text-muted">Please connect your wallet to access blockchain features</p>
                <i className="fa fa-wallet fa-3x text-muted mb-3"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">Blockchain Wallet Demo</h2>
          
          {/* Wallet Status Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h5><i className="fa fa-info-circle me-2"></i>Wallet Status</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Address:</strong> {wallet.address}</p>
                  <p><strong>Network:</strong> {wallet.networkName}</p>
                  <p><strong>Supported:</strong> 
                    <span className={`badge ${wallet.isSupported ? 'bg-success' : 'bg-warning'} ms-2`}>
                      {wallet.isSupported ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
                <div className="col-md-6">
                  <p><strong>Balance:</strong> {parseFloat(wallet.balance).toFixed(4)} {wallet.networkId === 137 ? 'MATIC' : 'ETH'}</p>
                  <p><strong>Network ID:</strong> {wallet.networkId}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Send Native Token */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5><i className="fa fa-paper-plane me-2"></i>Send {wallet.networkId === 137 ? 'MATIC' : 'ETH'}</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSendToken}>
                    <div className="mb-3">
                      <label className="form-label">Recipient Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={sendAddress}
                        onChange={(e) => setSendAddress(e.target.value)}
                        placeholder="0x..."
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Amount</label>
                      <input
                        type="number"
                        step="0.001"
                        className="form-control"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.1"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isTransactionPending}
                    >
                      {isTransactionPending ? 'Sending...' : 'Send Token'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* NFT Minting */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5><i className="fa fa-gem me-2"></i>Mint NFT</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleMintNFT}>
                    <div className="mb-3">
                      <label className="form-label">Contract Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="0x..."
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Mint Price (ETH/MATIC)</label>
                      <input
                        type="number"
                        step="0.001"
                        className="form-control"
                        value={mintPrice}
                        onChange={(e) => setMintPrice(e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={isTransactionPending}
                    >
                      {isTransactionPending ? 'Minting...' : 'Mint NFT'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Interaction */}
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5><i className="fa fa-code me-2"></i>Contract Interaction Demo</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <input
                        type="text"
                        className="form-control"
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder="Enter contract address to read totalSupply..."
                      />
                    </div>
                    <div className="col-md-4">
                      <button 
                        onClick={handleContractRead}
                        className="btn btn-info w-100"
                        disabled={isTransactionPending}
                      >
                        Read Contract
                      </button>
                    </div>
                  </div>
                  <small className="text-muted">
                    This demo reads the totalSupply function from an ERC721 contract
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Controls */}
          {(isTransactionPending || transactionHash || transactionError) && (
            <div className="row">
              <div className="col-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5><i className="fa fa-history me-2"></i>Transaction Status</h5>
                    <button 
                      onClick={resetTransactionState}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Clear Status
                    </button>
                  </div>
                  <div className="card-body">
                    {isTransactionPending && (
                      <div className="alert alert-info">
                        <i className="fa fa-spinner fa-spin me-2"></i>
                        {transactionMessage}
                      </div>
                    )}
                    {transactionHash && (
                      <div className="alert alert-success">
                        <i className="fa fa-check-circle me-2"></i>
                        Transaction successful! Hash: {transactionHash}
                      </div>
                    )}
                    {transactionError && (
                      <div className="alert alert-danger">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {transactionError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletDemo;
