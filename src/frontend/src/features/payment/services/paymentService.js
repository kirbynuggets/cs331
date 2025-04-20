import apiService from '../../../services/apiClient';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const paymentService = {
  // Initiate a new payment
  initiatePayment: async (amount) => {
    try {
      // Call server to create Razorpay order
      const response = await apiService.initiatePayment(amount);
      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  },

  // Process payment with Razorpay
  processPayment: async (paymentData) => {
    try {
      // Load Razorpay script if not already loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay checkout script');
      }

      const { order_id, amount, currency, callback_url, prefill, key_id } = paymentData;

      // Create new promise for handling payment flow
      return new Promise((resolve, reject) => {
        const options = {
          key: key_id, // Razorpay API key from your backend
          amount: amount * 100, // Razorpay expects amount in paisa (multiply by 100)
          currency: currency || 'INR',
          name: 'LUXE Fashion Store',
          description: 'Payment for your order',
          order_id: order_id,
          handler: function (response) {
            // On successful payment
            resolve(response);
          },
          prefill: {
            name: prefill?.name || '',
            email: prefill?.email || '',
            contact: prefill?.phone || '',
          },
          notes: {
            address: prefill?.address || 'Customer Address',
          },
          theme: {
            color: '#3f51b5', // Primary color of your app
          },
          modal: {
            ondismiss: function() {
              reject(new Error('Payment cancelled by user'));
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Verify payment with server
  verifyPayment: async (paymentData) => {
    try {
      const response = await apiService.verifyPayment(paymentData);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
};

export default paymentService;