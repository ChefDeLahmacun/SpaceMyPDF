import React, { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    paypal: any;
  }
}



// Global PayPal SDK state management
let paypalSDKLoaded = false;
let paypalSDKLoading = false;
let paypalSDKPromise: Promise<void> | null = null;

const DonationsBox = () => {
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCardSelected, setIsCardSelected] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const buttonInstance = useRef<any>(null);
  const [donationAmount, setDonationAmount] = useState('1.00');
  // Add a ref to track the current amount for PayPal
  const currentAmountRef = useRef('1.00');
  const currentOrderRef = useRef<any>(null);
  // Add a timeout ref for debouncing
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Add a key state to force re-render of the PayPal button container
  const [buttonKey, setButtonKey] = useState<number>(0);
  // Add a ref to track the last clicked button
  const lastClickedButtonRef = useRef<string | null>(null);
  // Add currency state
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');
  // Add donation success state
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  // Add payment method state
  const [paymentMethod, setPaymentMethod] = useState('');
  // Add loading error state
  const [loadingError, setLoadingError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  // Add a state to track if we need to force update the button
  const [forceUpdate, setForceUpdate] = useState(false);
  // Add error message state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Add state to track currency changes
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);
  
  // Currency options with symbols - Only GBP and USD
  const currencies = [
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'USD', symbol: '$', name: 'US Dollar' }
  ];
  
  // Get current currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    return currency ? currency.symbol : '£';
  };

  // Function to safely load PayPal SDK
  const loadPayPalSDK = (currency: string = selectedCurrency): Promise<void> => {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (paypalSDKLoaded && window.paypal) {
        resolve();
        return;
      }

      // If currently loading, return the existing promise
      if (paypalSDKLoading && paypalSDKPromise) {
        paypalSDKPromise.then(resolve).catch(reject);
        return;
      }

      // If already loaded but window.paypal is not available, reset state
      if (paypalSDKLoaded && !window.paypal) {
        paypalSDKLoaded = false;
      }

      // Start loading
      paypalSDKLoading = true;
      paypalSDKPromise = new Promise((innerResolve, innerReject) => {
        // Check if script already exists
        const existingScript = document.querySelector('#paypal-script');
        if (existingScript) {
          existingScript.remove();
        }

        // Create new script element with dynamic currency
        const script = document.createElement('script');
        script.id = 'paypal-script';
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${currency}&intent=capture&enable-funding=card&disable-funding=paylater&locale=en_US&commit=true`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          // Wait a bit for PayPal to fully initialize
          setTimeout(() => {
            if (window.paypal && window.paypal.Buttons) {
              paypalSDKLoaded = true;
              paypalSDKLoading = false;
              innerResolve();
            } else {
              paypalSDKLoading = false;
              innerReject(new Error('PayPal SDK failed to initialize'));
            }
          }, 100);
        };

        script.onerror = () => {
          paypalSDKLoading = false;
          innerReject(new Error('Failed to load PayPal SDK'));
        };

        document.head.appendChild(script);
      });

      paypalSDKPromise.then(resolve).catch(reject);
    });
  };

  const initPayPalButton = async () => {
    try {
      // Load PayPal SDK if not already loaded with current currency
      await loadPayPalSDK(selectedCurrency);
    } catch (error) {
      setLoadingError(true);
      setErrorMessage('PayPal SDK failed to load. Please refresh the page and try again.');
      return;
    }
    
    if (!window.paypal) {
      setLoadingError(true);
      setErrorMessage('PayPal SDK failed to load. Please refresh the page and try again.');
      return;
    }
    
    if (!buttonContainerRef.current) {
      setErrorMessage('There was an error initializing the payment system. Please refresh the page.');
      return;
    }

    // Initialize PayPal button silently
    try {
      // Cleanup previous instance if it exists
      if (buttonInstance.current) {
        try {
          buttonInstance.current.close();
        } catch (error) {
          // Ignore cleanup errors
        }
        buttonInstance.current = null;
      }

      // Check if the PayPal Buttons function is available
      if (!window.paypal.Buttons) {
        setLoadingError(true);
        setErrorMessage('PayPal payment system is not available. Please try again later or use the direct PayPal link.');
        return;
      }

      buttonInstance.current = window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 45,
          tagline: false
        },
        
        // Use a more stable configuration
        fundingSource: undefined,
        
        createOrder: (_data: any, actions: any) => {
          try {
            // Always get the current donation amount from the ref at the time of order creation
            // This ensures we use the latest value even if the button wasn't re-rendered
            let formattedAmount = currentAmountRef.current;
            
            // Triple-check: if the ref is empty or invalid, use the state value
            if (!formattedAmount || !validateAmount(formattedAmount)) {
              formattedAmount = validateAmount(donationAmount) ? formatAmount(donationAmount) : '1.00';
              currentAmountRef.current = formattedAmount;
            }
            
            
            // For card payments, we need to ensure the order is created properly
            const isCardPayment = _data?.fundingSource === 'card';
            if (isCardPayment) {
              
              // Store the payment source for later reference
              lastClickedButtonRef.current = 'card';
              
              // For card payments, we need to use a specific configuration
              return actions.order.create({
                intent: 'CAPTURE',
                purchase_units: [{
                  amount: {
                    value: formattedAmount,
                    currency_code: selectedCurrency,
                    breakdown: {
                      item_total: {
                        currency_code: selectedCurrency,
                        value: formattedAmount
                      }
                    }
                  },
                  description: 'Donation to SpaceMyPDF',
                  items: [{
                    name: 'Donation',
                    description: 'Donation to SpaceMyPDF',
                    quantity: '1',
                    unit_amount: {
                      currency_code: selectedCurrency,
                      value: formattedAmount
                    },
                    category: 'DIGITAL_GOODS'
                  }],
                  shipping_preference: 'NO_SHIPPING'
                }],
                application_context: {
                  shipping_preference: 'NO_SHIPPING',
                  user_action: 'PAY_NOW',
                  brand_name: 'SpaceMyPDF',
                  landing_page: 'BILLING',
                  payment_method: {
                    payer_selected: 'PAYPAL',
                    payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
                  }
                }
              });
            }
            
            // For PayPal payments, use the standard configuration
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: formattedAmount,
                  currency_code: selectedCurrency // Use selected currency
                },
                description: 'Donation to SpaceMyPDF',
                // Add shipping preference to indicate no shipping is required
                shipping_preference: 'NO_SHIPPING'
              }],
              // Add application context to specify this is a donation
              application_context: {
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'SpaceMyPDF',
                landing_page: 'LOGIN'
              }
            });
          } catch (error) {
            alert('There was an error creating your donation. Please try again or use the direct PayPal link.');
            throw error;
          }
        },
        
        onApprove: async (_data: any, actions: any) => {
          try {
            // Add a more robust capture with better error handling
            let order;
            try {
              // For card payments, we need to ensure we're using the correct capture method
              const isCardPayment = _data.fundingSource === 'card';
              
              // Use a timeout to ensure the PayPal system has time to process the payment
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              order = await actions.order.capture();
              
              // For card payments, log additional details
              if (isCardPayment || (order.payment_source && order.payment_source.card)) {
                // Card payment details handled
              }
            } catch (captureError) {
              // Try to get order details even if capture failed
              try {
                const orderDetails = await actions.order.get();
                
                // For card payments, sometimes the capture fails but the payment still went through
                // In this case, we'll treat it as a success if we can get the order details
                if (_data.fundingSource === 'card' && orderDetails) {
                  order = orderDetails;
                } else {
                  throw captureError;
                }
              } catch (getOrderError) {
                // Could not get order details
              }
            }
            
            // Detect payment method with more detail
            let paymentMethodUsed = 'PayPal';
            let paymentDetails = '';
            
            if (order.payment_source) {
              if (order.payment_source.card) {
                const card = order.payment_source.card;
                paymentMethodUsed = `Card (${card.brand || 'Unknown'} ${card.last_digits || 'xxxx'})`;
                paymentDetails = `${card.brand || 'Card'} ending in ${card.last_digits || 'xxxx'}`;
              } else if (order.payment_source.paypal) {
                const pp = order.payment_source.paypal;
                paymentMethodUsed = `PayPal (${pp.email_address || 'Unknown'})`;
                paymentDetails = pp.email_address || 'Unknown PayPal account';
              }
            } else if (_data.fundingSource === 'card') {
              // Fallback for card payments when payment_source is not available
              paymentMethodUsed = 'Credit/Debit Card';
            }
            
            // Update state with transaction details
            setIsExpanded(false);
            setDonationSuccess(true);
            setTransactionId(order.id || _data.orderID || 'Unknown');
            setPaymentMethod(paymentMethodUsed);
            
            // Success state updated
            
            return order;
          } catch (error: any) {
            // Set error message in state instead of using alert
            setErrorMessage(`There was an error processing your donation: ${error.message || 'Unknown error'}. Please try again or use the direct PayPal link.`);
            setIsExpanded(false); // Collapse the expanded section
            
            // Rethrow to ensure PayPal handles the error
            throw error;
          }
        },
        
        onError: (err: Error) => {
          // Suppress PayPal SDK internal warnings and errors
          if (err.message && (
            err.message.includes('global_session_not_found') ||
            err.message.includes('session') ||
            err.message.includes('prebuild')
          )) {
            // These are internal PayPal SDK warnings, not user-facing errors
            return;
          }
          
          // Set error message in state instead of using alert
          let errorMsg = 'Detected popup close. Please try again or use the direct PayPal link.';
          if (err.message && err.message.includes('popup')) {
            errorMsg = 'Detected popup close. Please try again or use the direct PayPal link.';
          } else if (err.message) {
            errorMsg = `PayPal error: ${err.message}. Please try again or use the direct PayPal link.`;
          }
          
          setErrorMessage(errorMsg);
          setIsExpanded(false); // Collapse the expanded section
        },

        onInit: function(_data: any, actions: any) {
          // Modern PayPal SDK doesn't require getFundingEligibility check
          // Card funding is automatically handled by the SDK
          
          // Set up observer to track card selection state
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'attributes' || mutation.type === 'childList') {
                // Check if card payment method is selected by looking for active card button
                const cardButton = document.querySelector('[data-funding-source="card"].paypal-button-active');
                const cardForm = document.querySelector('.paypal-card-form');
                
                const isNowCardSelected = !!(cardButton || cardForm);
                setIsCardSelected(isNowCardSelected);
              }
            });
          });
          
          // Start observing the button container for changes
          if (buttonContainerRef.current) {
            observer.observe(buttonContainerRef.current, { 
              attributes: true, 
              childList: true,
              subtree: true 
            });
          }
        },

        onClick: (data: any) => {
          // Store which button was clicked
          if (data && data.fundingSource) {
            lastClickedButtonRef.current = data.fundingSource;
            // Set card selected state if card is the funding source
            if (data.fundingSource === 'card') {
              setIsCardSelected(true);
              
              // Force a small delay to ensure the card form is properly initialized
              setTimeout(() => {
                // Check if the card form is visible in the DOM
                const cardForm = document.querySelector('.paypal-card-form');
              }, 1000);
            }
          }
          
          // CRITICAL: Always update the current amount ref with the latest donation amount
          // This ensures the createOrder function gets the most recent value
          const currentAmount = donationAmount || '1.00';
          const formattedAmount = validateAmount(currentAmount) ? formatAmount(currentAmount) : '1.00';
          
          // Update the ref immediately
          currentAmountRef.current = formattedAmount;
          
          // Update state if different
          if (donationAmount !== formattedAmount) {
            setDonationAmount(formattedAmount);
          }
          
          setIsExpanded(true);
        },

        onCancel: () => {
          setIsExpanded(false);
        }
      });

      const renderResult = buttonInstance.current.render(buttonContainerRef.current);
      setIsPayPalLoaded(true);

    } catch (error) {
      // Use error message state instead of alert
      setErrorMessage('There was an error loading the PayPal button. Please refresh the page and try again.');
      setLoadingError(true);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty values during typing
    if (value === '') {
      setDonationAmount('');
      return;
    }
    
    // Only validate the format but don't convert to fixed decimal during typing
    const isValid = /^\d*\.?\d{0,2}$/.test(value);
    if (isValid) {
      setDonationAmount(value);
      
      // Clear any existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      // Use a reasonable timeout (1 second) to allow user to finish typing
      updateTimeoutRef.current = setTimeout(() => {
        if (validateAmount(value)) {
          const formattedAmount = formatAmount(value);
          
          // Always update the ref
          currentAmountRef.current = formattedAmount;
          setDonationAmount(formattedAmount);
          
          // Reinitialize PayPal button with new amount
          if (window.paypal && window.paypal.Buttons && buttonInstance.current) {
            try {
              buttonInstance.current.close();
              buttonInstance.current = null;
              
              // Reinitialize the button with new amount
              setTimeout(() => {
                initPayPalButton();
              }, 100);
            } catch (error) {
              // Error closing PayPal button
            }
          }
        }
      }, 1000);
    }
  };

  // Add a function to handle amount validation on blur
  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      setDonationAmount('1.00');
      currentAmountRef.current = '1.00';
    } else if (numValue > 10000) {
      setDonationAmount('10000.00');
      currentAmountRef.current = '10000.00';
    } else {
      // Format to 2 decimal places
      const formattedValue = numValue.toFixed(2);
      setDonationAmount(formattedValue);
      currentAmountRef.current = formattedValue;
    }
  };

  const validateAmount = (value: string): boolean => {
    // During typing, allow partial inputs like "0." or "."
    if (value === '.' || value === '0.' || value.match(/^\d+\.$/)) {
      return true;
    }
    
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0.01 && num <= 10000;
  };

  const formatAmount = (value: string): string => {
    const num = parseFloat(value);
    return num.toFixed(2);
  };

  // Handle currency change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value;
    setSelectedCurrency(newCurrency);
    setIsChangingCurrency(true);
    
    // Clean up existing PayPal button
    if (buttonInstance.current) {
      try {
        buttonInstance.current.close();
        buttonInstance.current = null;
      } catch (error) {
        // Error closing PayPal button
      }
    }
    
    // Reset states
    setLoadingError(false);
    setErrorMessage(null);
    setIsPayPalLoaded(false);
    
    // Reset global PayPal SDK state to force reload with new currency
    paypalSDKLoaded = false;
    paypalSDKLoading = false;
    paypalSDKPromise = null;
    
    // Remove existing PayPal script
    const existingScript = document.querySelector('#paypal-script');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Reload PayPal SDK with new currency
    setTimeout(async () => {
      try {
        await initPayPalButton();
        setIsPayPalLoaded(true);
        setLoadingError(false);
      } catch (error) {
        setLoadingError(true);
        setErrorMessage('Failed to switch currency. Please refresh the page.');
      }
      setIsChangingCurrency(false);
    }, 500);
  };

  // Add function to reset donation success state
  const resetDonationSuccess = () => {
    // First set donation success to false
    setDonationSuccess(false);
    setTransactionId('');
    setPaymentMethod('');
    setErrorMessage(null); // Clear any error messages
    
    // Then increment the button key to force a complete re-render of the button container
    // Use a slight delay to ensure state updates have completed
    setTimeout(() => {
      setButtonKey(prevKey => prevKey + 1);
    }, 50);
  };

  // Add function to manually reload PayPal
  const handleManualReload = () => {
    // First unmount the PayPal button by setting a temporary flag
    setIsPayPalLoaded(false);
    
    // Then after a short delay, trigger a complete remount
    setTimeout(() => {
      setLoadAttempts(prev => prev + 1);
      setButtonKey(prev => prev + 1);
      setLoadingError(false);
    }, 100);
  };

  // Initialize PayPal button on component mount
  useEffect(() => {
    const initializePayPal = async () => {
      try {
        await initPayPalButton();
        setIsPayPalLoaded(true);
        setLoadingError(false);
      } catch (error) {
        setLoadingError(true);
        setErrorMessage('Failed to initialize PayPal. Please refresh the page and try again.');
      }
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initializePayPal, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Suppress PayPal SDK console warnings
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Override console methods to filter PayPal SDK warnings
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('global_session_not_found') || 
          message.includes('PayPal') && message.includes('session') ||
          message.includes('zoid_allow_delegate_three_domain_secure')) {
        // Suppress PayPal session warnings and zoid errors
        return;
      }
      originalWarn.apply(console, args);
    };
    
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('global_session_not_found') || 
          message.includes('PayPal') && message.includes('session') ||
          message.includes('zoid_allow_delegate_three_domain_secure')) {
        // Suppress PayPal session errors and zoid errors
        return;
      }
      originalError.apply(console, args);
    };
    
    // Restore original console methods on cleanup
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  // Add function to create a direct PayPal donation URL
  const getDirectPayPalUrl = () => {
    // Always use production URL
    const businessEmail = process.env.NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL || 
        'your-business-email@example.com'; // Default placeholder, will be replaced by actual env var
    return `https://www.paypal.com/donate?business=${encodeURIComponent(businessEmail)}&amount=${donationAmount}&currency_code=${selectedCurrency}&item_name=Donation%20to%20SpaceMyPDF`;
  };

  // Add function to create PayPal.me URL for USD
  const getPayPalMeUrl = () => {
    const amount = donationAmount || '1.00';
    return `https://www.paypal.com/paypalme/spacemypdf/${amount}${selectedCurrency}`;
  };

  // PayPal configuration is checked during initialization

  // Card payments configuration is handled automatically by PayPal SDK

  // Add function to check transaction status
  const checkTransactionStatus = (transactionId: string) => {
    // In a real implementation, you would make an API call to PayPal to check the status
    // For now, we'll just provide guidance
    
    if (process.env.NODE_ENV === 'development') {
      // Check if it was a card payment
      const wasCardPayment = paymentMethod.includes('Card');
      if (wasCardPayment) {
        return `Sandbox card payment (ID: ${transactionId}) was successfully processed. Note that sandbox card payments will not appear in transaction history due to PayPal sandbox limitations.`;
      } else {
        return `Sandbox PayPal payment (ID: ${transactionId}). Check your PayPal sandbox accounts for details.`;
      }
    } else {
      return `Transaction ID: ${transactionId}. Please check your PayPal account for details.`;
    }
  };

  // Add a function to handle quick amount selection
  const handleQuickAmountClick = (amount: string) => {
    setDonationAmount(amount);
    currentAmountRef.current = amount;
    
    // Reinitialize PayPal button with new amount
    if (window.paypal && window.paypal.Buttons && buttonInstance.current) {
      try {
        buttonInstance.current.close();
        buttonInstance.current = null;
        
        // Reinitialize the button with new amount
        setTimeout(() => {
          initPayPalButton();
        }, 100);
      } catch (error) {
        // Error closing PayPal button
      }
    }
  };
  
  // Effect to handle force updates
  useEffect(() => {
    if (forceUpdate && !donationSuccess && !isChangingCurrency) {
      setForceUpdate(false);
      setTimeout(async () => {
        await initPayPalButton();
      }, 200);
    }
  }, [forceUpdate, donationSuccess, isChangingCurrency]);

  // Effect to reinitialize PayPal button when currency changes
  useEffect(() => {
    if (!donationSuccess && !isChangingCurrency && isPayPalLoaded) {
      // Clean up existing button
      if (buttonInstance.current) {
        try {
          buttonInstance.current.close();
          buttonInstance.current = null;
        } catch (error) {
          // Error closing existing button for currency change
        }
      }
      
      // Reinitialize with new currency
      setTimeout(async () => {
        try {
          await initPayPalButton();
        } catch (error) {
          // Error reinitializing PayPal button for currency change
        }
      }, 100);
    }
  }, [selectedCurrency, donationSuccess, isChangingCurrency, isPayPalLoaded]);

  // Add an effect to monitor the card section state
  useEffect(() => {
    // Function to check if the card section is open
    const checkCardSectionOpen = () => {
      const cardSection = document.querySelector('.paypal-card-form');
      const cardButton = document.querySelector('[data-funding-source="card"].paypal-button-active');
      
      // Update the isCardSelected state based on what we find in the DOM
      setIsCardSelected(!!(cardSection || cardButton));
    };

    // Set up a mutation observer to watch for changes in the button container
    if (buttonContainerRef.current) {
      const observer = new MutationObserver(() => {
        checkCardSectionOpen();
      });
      
      observer.observe(buttonContainerRef.current, { 
        childList: true, 
        subtree: true,
        attributes: true
      });
      
      // Initial check
      checkCardSectionOpen();
      
      return () => observer.disconnect();
    }
  }, [isPayPalLoaded]);

  // Clean up the timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Clean up PayPal script on unmount
  useEffect(() => {
    return () => {
      // Clean up PayPal button
      if (buttonInstance.current) {
        try {
          buttonInstance.current.close();
          buttonInstance.current = null;
        } catch (error) {
          // Error closing PayPal button on unmount
        }
      }
      
      // Remove PayPal script
      const paypalScript = document.querySelector('#paypal-script');
      if (paypalScript) {
        paypalScript.remove();
      }
      
      // Reset global state
      paypalSDKLoaded = false;
      paypalSDKLoading = false;
      paypalSDKPromise = null;
    };
  }, []);




  return (
    <div style={{
      minHeight: isExpanded ? '850px' : '230px',
      height: 'auto',
      backgroundColor: '#ffd9d9',
      marginTop: '3vh',
      marginBottom: '3vh',
      borderRadius: '25px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '2vh 4%',
      paddingBottom: '4vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      zIndex: 4,
      transition: 'min-height 0.3s ease-in-out',
      width: '100%',
      maxWidth: '100%',
    }}>
      
      <h2 style={{
        fontSize: 'clamp(18px, 5vw, 22px)',
        color: '#333',
        marginBottom: '2vh',
        fontWeight: '600'
      }}>
        Support SpaceMyPDF
      </h2>
      
      {donationSuccess ? (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '4%',
          borderRadius: '25px',
          marginTop: '2vh',
          marginBottom: '2vh',
          width: '90%',
          maxWidth: '500px',
          border: '1px solid #c3e6cb',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2vh'
        }}>
          <div style={{
            fontSize: '50px',
            marginBottom: '10px'
          }}>
            🎉
          </div>
          <h3 style={{
            fontSize: '20px',
            margin: '0 0 10px 0'
          }}>
            Thank You For Your Donation!
          </h3>
          <p style={{
            fontSize: '16px',
            margin: '0 0 5px 0'
          }}>
            Your support helps keep SpaceMyPDF free for everyone.
          </p>
          <div style={{
            fontSize: '14px',
            color: '#666',
            margin: '10px 0 0 0',
            padding: '10px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '4px',
            width: '100%'
          }}>
            Transaction ID: {transactionId}
          </div>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '10px 0 0 0',
            padding: '10px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '4px',
            width: '100%'
          }}>
            Payment Method: {paymentMethod}
          </p>
          
          {paymentMethod.includes('Card') && (
            <div style={{
              fontSize: '13px',
              color: '#666',
              margin: '5px 0 0 0',
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: '4px',
              width: '100%',
              textAlign: 'left'
            }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Note about card payments:</p>
              <ul style={{ margin: '0', paddingLeft: '20px' }}>
                <li>Card payments may take up to 24 hours to appear in your PayPal account</li>
                <li>Check the "Activity" section in your PayPal account</li>
                <li>Look in both "Completed" and "Processing" sections</li>
              </ul>
            </div>
          )}
          <button 
            onClick={() => {
              resetDonationSuccess();
              // Also check the transaction status
              checkTransactionStatus(transactionId);
            }}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Make Another Donation
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px',
            maxWidth: '100%',
            padding: '0 2%',
            boxSizing: 'border-box'
          }}>
            <p style={{
              fontSize: 'clamp(14px, 4vw, 15px)',
              color: '#555',
              margin: '0',
              lineHeight: '1.5',
              width: '100%',
              wordWrap: 'break-word'
            }}>
              If you find SpaceMyPDF helpful, please consider supporting it.
            </p>
            <p style={{
              fontSize: 'clamp(15px, 4vw, 16px)',
              color: '#444',
              fontWeight: '500',
              margin: '0',
              lineHeight: '1.5',
              width: '100%',
              wordWrap: 'break-word'
            }}>
              Every donation counts, even just £1 makes a difference!
            </p>
            <p style={{
              fontSize: 'clamp(14px, 4vw, 15px)',
              color: '#555',
              margin: '0',
              lineHeight: '1.5',
              width: '100%',
              wordWrap: 'break-word'
            }}>
              Your contribution helps keep the service free. All donations are processed securely through PayPal.
            </p>
          </div>
          
          <div style={{
            marginBottom: '0px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            width: '90%',
            maxWidth: '350px',
            boxSizing: 'border-box',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {/* Add currency selector */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              width: '100%',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <label 
                htmlFor="currencySelector"
                style={{
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  color: '#333',
                  fontWeight: '600'
                }}
              >
                Currency:
              </label>
              <select
                id="currencySelector"
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                style={{
                  padding: '6px 10px',
                  fontSize: 'clamp(12px, 3.5vw, 14px)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol}) - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <label 
              htmlFor="donationAmount"
              style={{
                fontSize: 'clamp(14px, 4vw, 16px)',
                color: '#333',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textAlign: 'center',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              Choose Your Donation Amount
              <span style={{ 
                color: '#e74c3c',
                fontSize: 'clamp(16px, 4.5vw, 18px)',
                lineHeight: 1,
                marginLeft: '4px'
              }}>*</span>
            </label>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              position: 'relative',
              justifyContent: 'center',
              width: '100%'
            }}>
              <span style={{
                fontSize: 'clamp(16px, 4.5vw, 18px)',
                color: '#333',
                fontWeight: '500'
              }}>{getCurrencySymbol()}</span>
              <input
                id="donationAmount"
                type="number"
                value={donationAmount}
                onChange={handleAmountChange}
                min="0.01"
                max="10000"
                step="0.01"
                required
                aria-required="true"
                style={{
                  width: '120px',
                  padding: '8px 12px',
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
                onBlur={handleAmountBlur}
              />
            </div>
            <p style={{
              fontSize: 'clamp(11px, 3.5vw, 13px)',
              color: '#666',
              margin: '2px 0 0 0',
              fontStyle: 'italic',
              width: '100%',
              textAlign: 'center'
            }}>
              Min: {getCurrencySymbol()}0.01 - Max: {getCurrencySymbol()}10,000
            </p>
            <p style={{
              fontSize: 'clamp(10px, 3vw, 12px)',
              color: '#e67e22',
              margin: '5px 0 0 0',
              fontStyle: 'italic',
              width: '100%',
              textAlign: 'center'
            }}>
              Please wait a moment after changing the amount to ensure it updates properly.
            </p>
          </div>
          
          {/* PayPal button container */}
          <div
            key={buttonKey}
            ref={buttonContainerRef}
            style={{
              border: '1px solid transparent', 
              padding: '0',
              minHeight: '45px',
              width: '100%',
              maxWidth: '300px',
              position: 'relative',
              marginTop: '-10px',
              marginLeft: 'auto',
              marginRight: 'auto',
              boxSizing: 'border-box'
            }}
          >
            {forceUpdate && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid rgba(0, 0, 0, 0.1)',
                  borderTop: '3px solid #003087',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            <div 
              key={`paypal-button-container-${buttonKey}-${loadAttempts}`}
              ref={buttonContainerRef}
              style={{
                width: '100%',
                maxWidth: '300px',
                minHeight: '45px',
                marginBottom: '0',
                marginTop: '-10px',
                padding: '0',
                position: 'relative',
                backgroundColor: 'transparent',
                boxSizing: 'border-box'
              }}
            >
              {(!isPayPalLoaded || isChangingCurrency) && !forceUpdate && (
                <div style={{
                  width: '100%',
                  height: '45px',
                  backgroundColor: '#FFC439',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#003087',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  {isChangingCurrency ? `Switching to ${selectedCurrency}...` : `Loading PayPal for ${selectedCurrency}...`}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ height: '10px' }}></div>
          
          {!isPayPalLoaded && (
            <div style={{
              padding: '10px',
              backgroundColor: loadingError ? '#f8d7da' : '#fff3cd',
              color: loadingError ? '#721c24' : '#856404',
              borderRadius: '4px',
              marginTop: '10px',
              fontSize: '14px',
              border: loadingError ? '1px solid #f5c6cb' : '1px solid #ffeeba'
            }}>
              {loadingError ? (
                <>
                  <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    PayPal failed to load after multiple attempts.
                  </p>
                  <ul style={{ textAlign: 'left', margin: '0 0 10px 0', paddingLeft: '20px' }}>
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>Try using a different browser</li>
                    <li>Disable any ad blockers or privacy extensions</li>
                  </ul>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <button 
                      onClick={handleManualReload}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '150px'
                      }}
                    >
                      Try Again
                    </button>
                    <p style={{ margin: '5px 0', fontSize: '13px' }}>or</p>
                    <a 
                      href={getPayPalMeUrl()} 
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        width: '150px',
                        textAlign: 'center'
                      }}
                    >
                      Donate via PayPal.me
                    </a>
                  </div>
                </>
              ) : (
                'PayPal is taking longer than expected to load. Please wait...'
              )}
            </div>
          )}
          
          <div className="donation-footer" style={{ 
            margin: '0',
            padding: '0',
            width: '100%',
            maxWidth: '100%'
          }}>
            <p style={{
              fontSize: 'clamp(12px, 3.5vw, 14px)',
              color: '#666',
              textAlign: 'center',
              margin: '0',
              padding: '0 5%',
              boxSizing: 'border-box',
              width: '100%'
            }}>
              🔒 Secure payments processed by PayPal with buyer and seller protection
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsBox; 