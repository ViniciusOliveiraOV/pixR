import { BoletoInfo, PixPayment, PaymentStatus } from '../types';
import { logger } from '../utils/logger';

export class PaymentRepository {
  private payments: Map<string, BoletoInfo | PixPayment> = new Map();

  // In a real implementation, this would connect to a database
  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData(): void {
    const sampleBoleto: BoletoInfo = {
      id: 'boleto-001',
      barcode: '03399.66290 60000.001014 41000.063305 8 84410000010000',
      amount: 150.00,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      beneficiary: 'Energia Elétrica SP',
      description: 'Conta de luz - Janeiro 2025',
      status: PaymentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const samplePix: PixPayment = {
      id: 'pix-001',
      pixKey: 'exemplo@email.com',
      amount: 500.00,
      description: 'Pagamento de aluguel',
      recipientName: 'João Silva',
      status: PaymentStatus.SCHEDULED,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.payments.set(sampleBoleto.id, sampleBoleto);
    this.payments.set(samplePix.id, samplePix);
  }

  async getPendingPayments(): Promise<(BoletoInfo | PixPayment)[]> {
    const pending = Array.from(this.payments.values()).filter(
      payment => payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.SCHEDULED
    );
    
    logger.info(`Found ${pending.length} pending payments`);
    return pending;
  }

  async getPaymentsDueToday(): Promise<(BoletoInfo | PixPayment)[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = Array.from(this.payments.values()).filter(payment => {
      if ('dueDate' in payment) {
        // Boleto
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate < tomorrow && payment.status === PaymentStatus.PENDING;
      } else {
        // PIX
        const scheduledDate = payment.scheduledDate ? new Date(payment.scheduledDate) : null;
        if (scheduledDate) {
          scheduledDate.setHours(0, 0, 0, 0);
          return scheduledDate >= today && scheduledDate < tomorrow && payment.status === PaymentStatus.SCHEDULED;
        }
      }
      return false;
    });

    logger.info(`Found ${dueToday.length} payments due today`);
    return dueToday;
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.status = status;
      payment.updatedAt = new Date();
      this.payments.set(paymentId, payment);
      logger.info(`Updated payment ${paymentId} status to ${status}`);
    }
  }

  async addPayment(payment: BoletoInfo | PixPayment): Promise<void> {
    this.payments.set(payment.id, payment);
    logger.info(`Added new payment: ${payment.id}`);
  }

  async getPaymentById(id: string): Promise<BoletoInfo | PixPayment | undefined> {
    return this.payments.get(id);
  }

  async getAllPayments(): Promise<(BoletoInfo | PixPayment)[]> {
    return Array.from(this.payments.values());
  }
}
