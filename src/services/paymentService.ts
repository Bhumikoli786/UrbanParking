export interface PaymentRequest {
  bookingId: string;
  amount: number;
  currency: string;
  method: 'UPI' | 'Card' | 'Wallet' | 'NetBanking';
  methodDetails: {
    upiId?: string;
    cardNumberLast4?: string;
    cardHolder?: string;
    walletProvider?: string;
    bankName?: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  amount: number;
  timestamp: string;
  errorMessage?: string;
}

class PaymentService {
  /**
   * Simulates a payment gateway transaction.
   * Modularized interface ready for Razorpay or Stripe SDK swap.
   */
  public async processPayment(req: PaymentRequest): Promise<PaymentResponse> {
    // Simulate real gateway network handshake
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Demo simulation logic: Always succeed unless amount is 0 or negative
    if (req.amount <= 0) {
      return {
        success: false,
        transactionId: '',
        paymentMethod: req.method,
        amount: req.amount,
        timestamp: new Date().toISOString(),
        errorMessage: 'Invalid payment amount specified.',
      };
    }

    const txnId = `TXN_${req.method.toUpperCase()}_${Math.floor(10000000000 + Math.random() * 90000000000)}`;

    return {
      success: true,
      transactionId: txnId,
      paymentMethod: req.method,
      amount: req.amount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export const paymentService = new PaymentService();
