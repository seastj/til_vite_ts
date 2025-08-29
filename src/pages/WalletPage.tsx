import React from 'react';
import Wallet from '../components/shop/Wallet';

function WalletPage() {
  const box: React.CSSProperties = {
    padding: 16,
    border: '1px solid #000',
    borderRadius: 12,
    background: 'fafafa',
    marginTop: 12,
    textAlign: 'center',
  };
  return (
    <div style={box}>
      <h2>내 지갑</h2>
      <Wallet />
    </div>
  );
}

export default WalletPage;
