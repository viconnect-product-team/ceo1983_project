/**
 * 46 — Design Pattern Pragmatism: STRATEGY PATTERN
 * Phục vụ Kịch bản 1: Đa thuật toán xử lý cổng thanh toán
 */

export interface PaymentIntent {
  orderId: string;
  amount: number;
  description: string;
  clientIp?: string;
  returnUrl?: string;
}

export interface PaymentProcessResult {
  success: boolean;
  paymentUrl?: string;
  qrCode?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferMemo: string;
  };
  method: string;
  transactionRef: string;
}

export interface IPaymentStrategy {
  readonly methodCode: string;
  processPayment(intent: PaymentIntent): Promise<PaymentProcessResult>;
}

export class BankTransferPaymentStrategy implements IPaymentStrategy {
  readonly methodCode = 'BANK_TRANSFER';

  async processPayment(intent: PaymentIntent): Promise<PaymentProcessResult> {
    const memo = `CEO1983 ${intent.orderId}`;
    return {
      success: true,
      method: 'BANK_TRANSFER',
      transactionRef: intent.orderId,
      bankAccount: {
        bankName: 'Ngân hàng Quân Đội (MB Bank)',
        accountNumber: '198388889999',
        accountHolder: 'CLB DOANH NHAN CEO 1983',
        transferMemo: memo,
      },
    };
  }
}

export class VietQRPaymentStrategy implements IPaymentStrategy {
  readonly methodCode = 'VIETQR';

  async processPayment(intent: PaymentIntent): Promise<PaymentProcessResult> {
    const memo = `CEO1983 ${intent.orderId}`;
    const qrUrl = `https://img.vietqr.io/image/MB-198388889999-compact2.png?amount=${intent.amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent('CLB DOANH NHAN CEO 1983')}`;
    return {
      success: true,
      method: 'VIETQR',
      transactionRef: intent.orderId,
      qrCode: qrUrl,
    };
  }
}

export class MoMoPaymentStrategy implements IPaymentStrategy {
  readonly methodCode = 'MOMO';

  async processPayment(intent: PaymentIntent): Promise<PaymentProcessResult> {
    return {
      success: true,
      method: 'MOMO',
      transactionRef: intent.orderId,
      paymentUrl:
        intent.returnUrl ||
        `https://test-payment.momo.vn/v2/gateway/pay?orderId=${intent.orderId}`,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=momo://pay?orderId=${intent.orderId}&amount=${intent.amount}`,
    };
  }
}

export class PaymentStrategyFactory {
  private static registry = new Map<string, IPaymentStrategy>([
    ['BANK_TRANSFER', new BankTransferPaymentStrategy()],
    ['VIETQR', new VietQRPaymentStrategy()],
    ['MOMO', new MoMoPaymentStrategy()],
  ]);

  static register(strategy: IPaymentStrategy) {
    this.registry.set(strategy.methodCode, strategy);
  }

  static getStrategy(method: string): IPaymentStrategy {
    const strategy = this.registry.get((method || 'VIETQR').toUpperCase());
    return strategy || this.registry.get('VIETQR')!;
  }
}
