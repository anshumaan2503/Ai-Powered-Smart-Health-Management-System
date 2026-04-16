import { paymentsAPI } from './api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  amount: number;
  paymentType: 'subscription' | 'appointment';
  referenceId?: string | number;
  onSuccess?: (response: any) => void;
  onFailure?: (error: any) => void;
  customerInfo?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export const processPayment = async (options: RazorpayOptions) => {
  try {
    // 1. Create order on backend
    const { data: orderData } = await paymentsAPI.createOrder(
      options.amount,
      options.paymentType,
      options.referenceId
    );

    const { order_id, key_id, currency } = orderData;

    // 2. Configure Razorpay options
    const razorpayOptions = {
      key: key_id,
      amount: options.amount * 100, // paise
      currency: currency,
      name: 'MediCare Pro',
      description: `Payment for ${options.paymentType}`,
      order_id: order_id,
      handler: async (response: any) => {
        try {
          // 3. Verify payment on backend
          const { data: verifyData } = await paymentsAPI.verifyPayment({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (verifyData.status === 'success') {
            toast.success('Payment Successful!');
            if (options.onSuccess) options.onSuccess(verifyData);
          } else {
            toast.error('Payment verification failed.');
            if (options.onFailure) options.onFailure(verifyData);
          }
        } catch (error: any) {
          console.error('Verification error:', error);
          toast.error(error.response?.data?.error || 'Payment verification failed.');
          if (options.onFailure) options.onFailure(error);
        }
      },
      prefill: options.customerInfo || {},
      theme: {
        color: '#2563eb', // blue-600
      },
      modal: {
        ondismiss: function() {
          toast.error('Payment cancelled.');
          if (options.onFailure) options.onFailure({ status: 'cancelled' });
        }
      }
    };

    // 3. Open Razorpay modal
    const rzp = new window.Razorpay(razorpayOptions);
    rzp.open();

  } catch (error: any) {
    console.error('Payment error:', error);
    toast.error(error.response?.data?.error || 'Failed to initialize payment.');
    if (options.onFailure) options.onFailure(error);
  }
};
