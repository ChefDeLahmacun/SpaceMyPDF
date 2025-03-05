import React, { useEffect, useState } from 'react';
import Script from 'next/script';

const PayPalTest = () => {
  const [status, setStatus] = useState('Loading...');
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    // Display the client ID being used
    setClientId(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'Not found');
  }, []);

  return (
    <div style={{
      padding: '20px',
      border: '1px solid #ccc',
      borderRadius: '8px',
      margin: '20px',
      backgroundColor: '#f9f9f9'
    }}>
      <h2>PayPal SDK Test</h2>
      
      <div>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Client ID:</strong> {clientId}</p>
      </div>
      
      <Script 
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Test PayPal script loaded');
          setStatus('PayPal SDK loaded successfully');
        }}
        onError={(e) => {
          console.error('Test PayPal script error:', e);
          setStatus('Error loading PayPal SDK');
        }}
      />
    </div>
  );
};

export default PayPalTest; 