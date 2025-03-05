'use client';

import React from 'react';
import PayPalTest from '../components/PayPalTest';

export default function PayPalTestPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>PayPal Integration Test</h1>
      <p>This page tests if the PayPal SDK loads correctly.</p>
      
      <PayPalTest />
      
      <div style={{ marginTop: '20px' }}>
        <h3>Troubleshooting Steps:</h3>
        <ol>
          <li>Check if the Client ID is displayed correctly above</li>
          <li>Check browser console for any errors</li>
          <li>Verify that your .env.local file contains the correct NEXT_PUBLIC_PAYPAL_CLIENT_ID</li>
          <li>Try restarting your development server</li>
        </ol>
      </div>
    </div>
  );
} 